package mg.fizanakara.api.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.fizanakara.api.dto.person.PersonDto;
import mg.fizanakara.api.dto.person.PersonResponseDto;
import mg.fizanakara.api.services.PersonService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admins/persons")
@RequiredArgsConstructor
@Slf4j
public class PersonController {
    private final PersonService personService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<PersonResponseDto>> getAllPersons() {
        log.info("Retrieving all persons");
        return ResponseEntity.ok(personService.getAllPersons());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<PersonResponseDto> getPersonById(@PathVariable String id) {
        log.info("Retrieving person with ID: {}", id);
        return ResponseEntity.ok(personService.getPersonById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<PersonResponseDto> createPerson(@RequestBody @Validated PersonDto dto) {
        log.info("Creating person: {} {}", dto.getFirstName(), dto.getLastName());
        return ResponseEntity.status(HttpStatus.CREATED).body(personService.createPerson(dto));
    }

    @PostMapping("/{id}/promote")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<PersonResponseDto> promoteToActiveMember(@PathVariable String id) {
        log.info("Promoting person {} to active member", id);
        return ResponseEntity.ok(personService.promoteToActiveMember(id));
    }

    @PostMapping("/{parentId}/children")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<PersonResponseDto> addChildToPerson(@PathVariable String parentId, @RequestBody @Validated PersonDto childDto) {
        childDto.setParentId(parentId);
        log.info("Adding child to parent {}: {}", parentId, childDto.getFirstName());
        return ResponseEntity.status(HttpStatus.CREATED).body(personService.createPerson(childDto));
    }

    @GetMapping("/{parentId}/children")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<PersonResponseDto>> getChildrenByParentId(@PathVariable String parentId) {
        log.info("Retrieving children for parent ID: {}", parentId);
        return ResponseEntity.ok(personService.getChildrenByParentId(parentId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<PersonResponseDto> updatePerson(@PathVariable String id, @RequestBody PersonDto dto) {
        log.info("Updating person ID: {}", id);
        return ResponseEntity.ok(personService.updatePerson(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> deletePerson(@PathVariable String id) {
        personService.deletePerson(id);
        log.info("Deleted person ID: {}", id);
        return ResponseEntity.ok(Map.of("message", "Person deleted successfully", "success", true));
    }

    @DeleteMapping("/delete-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> deleteAllPersons() {
        personService.deleteAllPersons();
        log.info("All persons deleted");
        return ResponseEntity.ok(Map.of("message", "All persons deleted", "success", true));
    }
}