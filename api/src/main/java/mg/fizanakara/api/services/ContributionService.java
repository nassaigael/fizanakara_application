package mg.fizanakara.api.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.fizanakara.api.dto.contributions.ContributionResponseDto;
import mg.fizanakara.api.dto.contributions.ContributionUpdateDto;
import mg.fizanakara.api.dto.contributions.ContributionYearDto;
import mg.fizanakara.api.dto.payments.PaymentResponseDto;
import mg.fizanakara.api.exceptions.ContributionNotFoundException;
import mg.fizanakara.api.models.Contribution;
import mg.fizanakara.api.models.Person;
import mg.fizanakara.api.models.enums.ContributionStatus;
import mg.fizanakara.api.models.enums.MemberStatus;
import mg.fizanakara.api.repository.ContributionRepository;
import mg.fizanakara.api.repository.PersonRepository;
import mg.fizanakara.api.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContributionService {
    private final ContributionRepository contributionRepository;
    private final PaymentRepository paymentRepository;
    private final PersonRepository personRepository;

    private final AtomicInteger sequenceCounter = new AtomicInteger(1);

    // GET ALL
    @Transactional(readOnly = true)
    public List<ContributionResponseDto> getAllContributions() {
        log.info("Retrieving all contributions");
        return contributionRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // GET BY PERSON AND YEAR
    @Transactional(readOnly = true)
    public List<ContributionResponseDto> getContributionsByPersonAndYear(String personId, Year year) {
        log.info("Retrieving contributions for person ID: {} and year: {}", personId, year);
        return contributionRepository.findByMemberIdAndYear(personId, year).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // BATCH CRÉATION ANNUELLE - Version corrigée
    @Transactional
    public List<ContributionResponseDto> createContributionsForYear(ContributionYearDto dto) {
        Year year = dto.getYear();
        int yearValue = year.getValue();
        log.info("========================================");
        log.info("Generating annual contributions for year: {}", year);
        log.info("========================================");

        // Calculer la date limite : 31 décembre de l'année - 18 ans
        LocalDate dateLimit = LocalDate.of(yearValue, 12, 31).minusYears(18);
        log.info("Date limit for eligibility (born on or before): {}", dateLimit);

        // Trouver les personnes nées avant la date limite
        List<Person> eligiblePersons = personRepository.findPersonsBornBefore(dateLimit);
        log.info("Found {} eligible persons for year {}", eligiblePersons.size(), yearValue);

        List<ContributionResponseDto> created = new ArrayList<>();

        // Récupérer le prochain numéro de séquence pour cette année
        int sequenceStart = getNextSequenceForYear(year);
        AtomicInteger sequenceCounter = new AtomicInteger(sequenceStart);

        for (Person person : eligiblePersons) {
            String personId = person.getId();

            // Vérifier si une cotisation existe déjà
            boolean exists = contributionRepository.hasDuplicateByMemberAndYear(personId, year, null);
            if (exists) {
                log.warn("Contribution for person {} and year {} already exists – skipping", personId, year);
                continue;
            }

            // Calculer le montant
            BigDecimal amount = calculateAmountForUser(person, year);
            log.info("Creating contribution for {} {} - Amount: {} Ar",
                    person.getFirstName(), person.getLastName(), amount);

            // Créer la cotisation avec un suffixe unique
            String suffix = String.format("%03d", sequenceCounter.getAndIncrement());
            Contribution contribution = Contribution.builder()
                    .year(year)
                    .amount(amount)
                    .status(ContributionStatus.PENDING)
                    .dueDate(LocalDate.of(yearValue, 12, 31))
                    .member(person)
                    .build();
            contribution.setSequenceSuffix(suffix);
            contribution.setId(contribution.generatedCustomId());

            Contribution saved = contributionRepository.save(contribution);
            created.add(mapToResponseDto(saved));
        }

        log.info("========================================");
        log.info("Generated {} new contributions for year: {}", created.size(), year);
        log.info("========================================");
        return created;
    }

    // Méthode pour obtenir le prochain numéro de séquence pour une année donnée
    private int getNextSequenceForYear(Year year) {
        // Récupérer toutes les cotisations de l'année
        List<Contribution> existingContributions = contributionRepository.findAll().stream()
                .filter(c -> c.getYear().equals(year))
                .collect(Collectors.toList());

        if (existingContributions.isEmpty()) {
            return 1;
        }

        // Trouver le plus grand suffixe
        int maxSuffix = 0;
        for (Contribution c : existingContributions) {
            if (c.getSequenceSuffix() != null) {
                try {
                    int suffix = Integer.parseInt(c.getSequenceSuffix());
                    if (suffix > maxSuffix) {
                        maxSuffix = suffix;
                    }
                } catch (NumberFormatException e) {
                    // Ignorer
                }
            }
        }
        return maxSuffix + 1;
    }

    // SINGLE POUR PERSON
    @Transactional
    public ContributionResponseDto createSingleContributionForPerson(Year year, String personId) {
        if (contributionRepository.hasDuplicateByMemberAndYear(personId, year, null)) {
            throw new IllegalArgumentException("Contribution for this person and year already exists");
        }

        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Person ID: " + personId));

        BigDecimal amount = calculateAmountForUser(person, year);

        Contribution contribution = Contribution.builder()
                .year(year)
                .amount(amount)
                .status(ContributionStatus.PENDING)
                .dueDate(LocalDate.of(year.getValue(), 12, 31))
                .member(person)
                .childId(person.isEligibleForContribution(year) ? null : personId)
                .build();

        String suffix = String.format("%03d", sequenceCounter.getAndIncrement());
        contribution.setSequenceSuffix(suffix);
        contribution.setId(contribution.generatedCustomId());

        Contribution saved = contributionRepository.save(contribution);
        return mapToResponseDto(saved);
    }

    // UPDATE
    @Transactional
    public ContributionResponseDto updateContribution(String id, ContributionUpdateDto dto) {
        Contribution contribution = contributionRepository.findById(id)
                .orElseThrow(() -> new ContributionNotFoundException("Contribution not found with ID: " + id));

        if (dto.getAmount() != null)
            contribution.setAmount(dto.getAmount());
        if (dto.getStatus() != null)
            contribution.setStatus(dto.getStatus());
        if (dto.getMemberId() != null) {
            Person person = personRepository.findById(dto.getMemberId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid Person ID"));
            contribution.setMember(person);
        }

        log.info("Updating contribution ID: {}", id);
        Contribution updated = contributionRepository.save(contribution);
        return mapToResponseDto(updated);
    }

    // DELETE
    @Transactional
    public void deleteContribution(String id) {
        Contribution contribution = contributionRepository.findById(id)
                .orElseThrow(() -> new ContributionNotFoundException("Contribution not found with ID: " + id));
        log.info("Deleting contribution ID: {}", id);
        contributionRepository.delete(contribution);
    }

    // UPDATE STATUS POST-PAIEMENT
    @Transactional
    public void updateContributionStatusAfterPayment(String contributionId) {
        Contribution contribution = contributionRepository.findById(contributionId)
                .orElseThrow(
                        () -> new ContributionNotFoundException("Contribution not found with ID: " + contributionId));

        BigDecimal totalPaid = paymentRepository.getTotalPaidByContributionId(contributionId);
        if (totalPaid == null)
            totalPaid = BigDecimal.ZERO;

        log.info("Updating status for contribution ID: {} totalPaid: {} amount: {}", contributionId, totalPaid,
                contribution.getAmount());

        if (totalPaid.compareTo(contribution.getAmount()) >= 0) {
            contribution.setStatus(ContributionStatus.PAID);
        } else if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            contribution.setStatus(ContributionStatus.PARTIAL);
        } else if (LocalDate.now().isAfter(contribution.getDueDate())) {
            contribution.setStatus(ContributionStatus.OVERDUE);
        } else {
            contribution.setStatus(ContributionStatus.PENDING);
        }

        contributionRepository.save(contribution);
    }

    // MAPPING DTO
    private ContributionResponseDto mapToResponseDto(Contribution contribution) {
        ContributionResponseDto dto = new ContributionResponseDto();
        dto.setId(contribution.getId());
        dto.setYear(contribution.getYear().getValue());
        dto.setAmount(contribution.getAmount());
        dto.setStatus(contribution.getStatus());
        dto.setDueDate(contribution.getDueDate());
        dto.setMemberId(contribution.getMember().getId());
        dto.setMemberName(contribution.getMember().getFirstName() + " " + contribution.getMember().getLastName());

        if (contribution.getChildId() != null) {
            dto.setChildId(contribution.getChildId());
        }

        BigDecimal totalPaid = paymentRepository.getTotalPaidByContributionId(contribution.getId());
        dto.setTotalPaid(totalPaid != null ? totalPaid : BigDecimal.ZERO);
        dto.setRemaining(contribution.getAmount().subtract(dto.getTotalPaid()));

        dto.setPayments(paymentRepository.findByContributionId(contribution.getId()).stream()
                .map(payment -> {
                    PaymentResponseDto pDto = new PaymentResponseDto();
                    pDto.setId(payment.getId());
                    pDto.setAmountPaid(payment.getAmountPaid());
                    pDto.setPaymentDate(LocalDate.from(payment.getPaymentDate()));
                    pDto.setStatus(payment.getStatus());
                    pDto.setContributionId(payment.getContribution().getId());
                    pDto.setPaymentTime(payment.getPaymentTime());
                    return pDto;
                })
                .collect(Collectors.toList()));

        return dto;
    }

    // CALCUL AMOUNT
    private BigDecimal calculateAmountForUser(Person person, Year year) {
        int age = person.calculateAgeAtYear(person.getBirthDate(), year);
        MemberStatus status = person.getStatus();
        if (age >= 18 && age <= 21 && status == MemberStatus.STUDENT) {
            return BigDecimal.valueOf(20000);
        }
        return BigDecimal.valueOf(40000);
    }
}