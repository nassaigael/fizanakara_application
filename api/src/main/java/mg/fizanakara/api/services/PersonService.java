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

    // CREATE PERSON - Sans génération automatique de contribution
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
        boolean isEligible = calculateEligibilityFromDto(dto.getBirthDate(), currentYear);

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

        log.info("Member created successfully without contribution. ID: {}", saved.getId());

        return mapToResponseDto(saved);
    }

    // PROMOTION À 18 ANS - Sans génération automatique de contribution
    @Transactional
    public PersonResponseDto promoteToActiveMember(String personId) {
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new PersonNotFoundException("Person not found with ID: " + personId));

        Year currentYear = Year.now();
        if (person.isEligibleForContribution(currentYear) && !person.isActiveMember()) {
            person.setIsActiveMember(true);
            person.setStatus(MemberStatus.WORKER);
            Person promoted = personRepository.save(person);

            log.info("Person {} promoted to active member. Contribution must be created manually", personId);
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

    // DELETE BY ID - Rend les enfants indépendants avant de supprimer le parent
    @Transactional
    public void deletePerson(String id) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new PersonNotFoundException("Person not found with ID: " + id));

        log.info("Deleting person with ID: {}", id);
        log.info("Person details - Name: {} {}, Has children: {}",
                person.getFirstName(), person.getLastName(), !person.getChildren().isEmpty());

        // 1. Rendre tous les enfants indépendants (parent_id = null) AVANT de supprimer le parent
        //    Cela supprime la dépendance de clé étrangère
        if (!person.getChildren().isEmpty()) {
            log.info("Person has {} children. Making them independent first", person.getChildren().size());
            
            for (Person child : person.getChildren()) {
                child.setParent(null);
                personRepository.save(child);
                log.debug("Child {} is now independent", child.getId());
            }
        }

        // 2. Supprimer les contributions du parent
        List<Contribution> parentContributions = contributionRepository.findByMemberId(id);
        if (!parentContributions.isEmpty()) {
            log.info("Deleting {} contributions for parent", parentContributions.size());
            for (Contribution contribution : parentContributions) {
                List<Payment> payments = paymentRepository.findByContributionId(contribution.getId());
                if (!payments.isEmpty()) {
                    paymentRepository.deleteAll(payments);
                }
            }
            contributionRepository.deleteAll(parentContributions);
        }

        // 3. Supprimer les contributions où le parent est child_id (par sécurité)
        List<Contribution> parentContributionsAsChild = contributionRepository.findByChildId(id);
        if (!parentContributionsAsChild.isEmpty()) {
            log.info("Deleting {} contributions where parent is child_id", parentContributionsAsChild.size());
            contributionRepository.deleteAll(parentContributionsAsChild);
        }

        // 4. Supprimer le parent (maintenant aucun enfant ne pointe vers lui)
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

    private boolean calculateEligibilityFromDto(LocalDate birthDate, Year year) {
        LocalDate endOfYear = LocalDate.of(year.getValue(), 12, 31);
        int age = endOfYear.getYear() - birthDate.getYear() -
                (endOfYear.isBefore(birthDate.withDayOfYear(birthDate.getDayOfYear())) ? 1 : 0);
        return age >= 18;
    }
}