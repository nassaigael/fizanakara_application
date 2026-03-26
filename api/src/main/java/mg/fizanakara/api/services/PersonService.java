package mg.fizanakara.api.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.fizanakara.api.dto.person.PersonDto;
import mg.fizanakara.api.dto.person.PersonResponseDto;
import mg.fizanakara.api.exceptions.PersonNotFoundException;
import mg.fizanakara.api.models.Contribution;
import mg.fizanakara.api.models.District;
import mg.fizanakara.api.models.Payment;
import mg.fizanakara.api.models.Person;
import mg.fizanakara.api.models.Tribute;
import mg.fizanakara.api.models.enums.MemberStatus;
import mg.fizanakara.api.repository.ContributionRepository;
import mg.fizanakara.api.repository.DistrictRepository;
import mg.fizanakara.api.repository.PaymentRepository;
import mg.fizanakara.api.repository.PersonRepository;
import mg.fizanakara.api.repository.TributeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PersonService {
    private final PersonRepository personRepository;
    private final DistrictRepository districtRepository;
    private final TributeRepository tributeRepository;
    private final SequenceService sequenceService;
    private final ContributionService contributionService;
    private final ContributionRepository contributionRepository;
    private final PaymentRepository paymentRepository;

    // GET ALL
    @Transactional
    public List<PersonResponseDto> getAllPersons() {
        log.info("Retrieving all persons");
        return personRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // GET BY ID
    @Transactional
    public PersonResponseDto getPersonById(String id) {
        log.info("Retrieving person with ID: {}", id);
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new PersonNotFoundException("Person not found with ID: " + id));
        return mapToResponseDto(person);
    }

    // CREATE PERSON
    @Transactional
    public PersonResponseDto createPerson(PersonDto dto) {
        log.info("Creating person: {} {} (parentId: {})", dto.getFirstName(), dto.getLastName(), dto.getParentId());

        // DUPLICATE PERSON
        boolean hasDuplicate = personRepository.hasDuplicateByKeyFields(
                dto.getFirstName(), dto.getLastName(), dto.getBirthDate(), dto.getPhoneNumber(),
                dto.getDistrictId(), dto.getTributeId(), dto.getStatus(), null);
        if (hasDuplicate) {
            throw new IllegalArgumentException("Person with these details already exists");
        }

        // Find FKs
        District district = districtRepository.findById(dto.getDistrictId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid District ID: " + dto.getDistrictId()));
        Tribute tribute = tributeRepository.findById(dto.getTributeId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Tribute ID: " + dto.getTributeId()));

        Person parent = null;
        if (dto.getParentId() != null) {
            parent = personRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid Parent ID: " + dto.getParentId()));
        }

        Year currentYear = Year.now();
        boolean isEligible = calculateEligibilityFromDto(dto.getBirthDate(), currentYear); // Méthode helper
                                                                                           // (ci-dessous)

        Person person = Person.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .birthDate(dto.getBirthDate())
                .gender(dto.getGender())
                .imageUrl(dto.getImageUrl())
                .phoneNumber(dto.getPhoneNumber())
                .status(dto.getStatus())
                .district(district)
                .tribute(tribute)
                .parent(parent)
                .isActiveMember(isEligible)
                .build();

        person.setSequenceNumber(sequenceService.getNextSequence("mbr_seq"));
        person.setId(person.generatedCustomId());
        person.setCreatedAt(LocalDate.now());

        Person saved = personRepository.save(person);

        if (parent != null) {
            parent.getChildren().add(saved);
            personRepository.save(parent);
        }

        if (isEligible) {
            contributionService.createSingleContributionForPerson(currentYear, saved.getId());
        }

        return mapToResponseDto(saved);
    }

    // PROMOTION À 18 ANS
    @Transactional
    public PersonResponseDto promoteToActiveMember(String personId) {
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new PersonNotFoundException("Person not found with ID: " + personId));

        Year currentYear = Year.now();
        if (person.isEligibleForContribution(currentYear) && !person.isActiveMember()) {
            person.setIsActiveMember(true);
            person.setStatus(MemberStatus.WORKER);
            Person promoted = personRepository.save(person);

            contributionService.createSingleContributionForPerson(currentYear, personId);

            log.info("Person {} promoted to active member (parent link preserved: {})", personId,
                    person.getParent() != null ? person.getParent().getId() : "none");
            return mapToResponseDto(promoted);
        }
        log.info("Person {} already active or not eligible", personId);
        return mapToResponseDto(person);
    }

    @Transactional
    public PersonResponseDto updatePerson(String id, PersonDto dto) {
        log.info("Updating person ID: {}", id);
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new PersonNotFoundException("Person not found with ID: " + id));

        // SET ALL ATTRIBUTE IF NULL
        if (dto.getFirstName() != null)
            person.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null)
            person.setLastName(dto.getLastName());
        if (dto.getBirthDate() != null)
            person.setBirthDate(dto.getBirthDate());
        if (dto.getGender() != null)
            person.setGender(dto.getGender());
        if (dto.getImageUrl() != null)
            person.setImageUrl(dto.getImageUrl());
        if (dto.getPhoneNumber() != null) {
            if (!person.getPhoneNumber().equals(dto.getPhoneNumber())
                    && personRepository.existsByPhoneNumber(dto.getPhoneNumber())) {
                throw new IllegalArgumentException("Phone number already exists");
            }
            person.setPhoneNumber(dto.getPhoneNumber());
        }
        if (dto.getStatus() != null)
            person.setStatus(dto.getStatus());
        if (dto.getDistrictId() != null) {
            District district = districtRepository.findById(dto.getDistrictId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid District ID"));
            person.setDistrict(district);
        }
        if (dto.getTributeId() != null) {
            Tribute tribute = tributeRepository.findById(dto.getTributeId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid Tribute ID"));
            person.setTribute(tribute);
        }

        // DUPLICATE CHECK
        if (personRepository.hasDuplicateByKeyFields(
                person.getFirstName(), person.getLastName(), person.getBirthDate(), person.getPhoneNumber(),
                person.getDistrict().getId(), person.getTribute().getId(), person.getStatus(), id)) {
            throw new IllegalArgumentException("Person with these details already exists");
        }

        Person updated = personRepository.save(person);
        log.info("Updated person ID {} successfully", id);
        return mapToResponseDto(updated);
    }

    // DELETE BY ID
    @Transactional
    public void deletePerson(String id) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new PersonNotFoundException("Person not found with ID: " + id));

        log.info("Deleting person with ID: {}", id);
        log.info("Person details - Name: {} {}, Age: {}, Has parent: {}, Has children: {}",
                person.getFirstName(), person.getLastName(),
                calculateAge(person.getBirthDate()),
                person.getParent() != null,
                !person.getChildren().isEmpty());

        // 1. Gérer les enfants de la personne supprimée
        if (!person.getChildren().isEmpty()) {
            log.info("Person {} has {} children. They will become independent (parent = null)",
                    person.getId(), person.getChildren().size());

            for (Person child : person.getChildren()) {
                // 1a. Supprimer TOUTES les contributions de l'enfant
                // (car l'enfant devient indépendant, ses cotisations sont à son nom)
                List<Contribution> childContributions = contributionRepository.findByMemberId(child.getId());
                if (!childContributions.isEmpty()) {
                    log.info("Deleting {} contributions for child {} before making them independent",
                            childContributions.size(), child.getId());

                    for (Contribution contribution : childContributions) {
                        // Supprimer les paiements associés
                        List<Payment> payments = paymentRepository.findByContributionId(contribution.getId());
                        if (!payments.isEmpty()) {
                            paymentRepository.deleteAll(payments);
                            log.debug("Deleted {} payments for contribution {}", payments.size(), contribution.getId());
                        }
                    }
                    contributionRepository.deleteAll(childContributions);
                }

                // 1b. Supprimer également les contributions où l'enfant est child_id
                List<Contribution> childContributionsAsChild = contributionRepository.findByChildId(child.getId());
                if (!childContributionsAsChild.isEmpty()) {
                    log.info("Deleting {} contributions where child is child_id", childContributionsAsChild.size());
                    for (Contribution contribution : childContributionsAsChild) {
                        List<Payment> payments = paymentRepository.findByContributionId(contribution.getId());
                        if (!payments.isEmpty()) {
                            paymentRepository.deleteAll(payments);
                        }
                    }
                    contributionRepository.deleteAll(childContributionsAsChild);
                }

                // 1c. Rendre l'enfant indépendant (parent = null)
                child.setParent(null);
                personRepository.save(child);
                log.debug("Child {} is now independent", child.getId());
            }
        }

        // 2. Supprimer les contributions de la personne elle-même
        List<Contribution> contributions = contributionRepository.findByMemberId(id);
        if (!contributions.isEmpty()) {
            log.info("Deleting {} contributions for person {}", contributions.size(), id);

            for (Contribution contribution : contributions) {
                List<Payment> payments = paymentRepository.findByContributionId(contribution.getId());
                if (!payments.isEmpty()) {
                    paymentRepository.deleteAll(payments);
                    log.debug("Deleted {} payments for contribution {}", payments.size(), contribution.getId());
                }
            }
            contributionRepository.deleteAll(contributions);
        }

        // 3. Supprimer les contributions où cette personne est référencée comme
        // child_id
        List<Contribution> contributionsAsChild = contributionRepository.findByChildId(id);
        if (!contributionsAsChild.isEmpty()) {
            log.info("Deleting {} contributions where person is child_id", contributionsAsChild.size());
            for (Contribution contribution : contributionsAsChild) {
                List<Payment> payments = paymentRepository.findByContributionId(contribution.getId());
                if (!payments.isEmpty()) {
                    paymentRepository.deleteAll(payments);
                }
            }
            contributionRepository.deleteAll(contributionsAsChild);
        }

        // 4. Retirer la personne de la liste des enfants de son parent
        if (person.getParent() != null) {
            Person parent = person.getParent();
            parent.getChildren().remove(person);
            personRepository.save(parent);
            log.info("Removed person from parent's children list: {}", parent.getId());
        }

        // 5. Supprimer la personne
        personRepository.delete(person);
        log.info("Successfully deleted person with ID: {}", id);
    }

    // DELETE ALL
    @Transactional
    public void deleteAllPersons() {
        personRepository.deleteAll();
        log.info("All persons deleted");
    }

    // GET BY DISTRICT
    @Transactional
    public List<PersonResponseDto> getPersonsByDistrictId(Long districtId) {
        log.info("Retrieving persons by district ID: {}", districtId);
        return personRepository.findByDistrictId(districtId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // GET CHILDREN BY PARENT ID
    @Transactional
    public List<PersonResponseDto> getChildrenByParentId(String parentId) {
        log.info("Retrieving children for parent ID: {}", parentId);
        return personRepository.findByParentId(parentId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private PersonResponseDto mapToResponseDto(Person person) {
        PersonResponseDto dto = new PersonResponseDto();
        dto.setId(person.getId());
        dto.setFirstName(person.getFirstName());
        dto.setLastName(person.getLastName());
        dto.setBirthDate(person.getBirthDate());
        dto.setGender(person.getGender());
        dto.setImageUrl(person.getImageUrl());
        dto.setPhoneNumber(person.getPhoneNumber());
        dto.setCreatedAt(person.getCreatedAt());
        dto.setSequenceNumber(person.getSequenceNumber());
        dto.setStatus(person.getStatus());
        dto.setIsActiveMember(person.isActiveMember());

        dto.setDistrictId(person.getDistrict().getId());
        dto.setDistrictName(person.getDistrict().getName());
        dto.setTributeId(person.getTribute().getId());
        dto.setTributeName(person.getTribute().getName());

        // Hiérarchie
        dto.setParentId(person.getParent() != null ? person.getParent().getId() : null);
        dto.setParentName(
                person.getParent() != null ? person.getParent().getFirstName() + " " + person.getParent().getLastName()
                        : null);
        dto.setChildrenCount(person.getChildren().size());
        dto.setChildren(person.getChildren());

        return dto;
    }

    // Helper pour calculer l'âge
    private int calculateAge(LocalDate birthDate) {
        LocalDate today = LocalDate.now();
        int age = today.getYear() - birthDate.getYear();
        if (today.getMonthValue() < birthDate.getMonthValue() ||
                (today.getMonthValue() == birthDate.getMonthValue() &&
                        today.getDayOfMonth() < birthDate.getDayOfMonth())) {
            age--;
        }
        return age;
    }

    private boolean calculateEligibilityFromDto(LocalDate birthDate, Year year) {
        LocalDate endOfYear = LocalDate.of(year.getValue(), 12, 31);
        int age = endOfYear.getYear() - birthDate.getYear() -
                (endOfYear.isBefore(birthDate.withDayOfYear(birthDate.getDayOfYear())) ? 1 : 0);
        return age >= 18;
    }
}