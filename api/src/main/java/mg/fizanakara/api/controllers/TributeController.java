package mg.fizanakara.api.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.fizanakara.api.dto.tributes.TributeDto;
import mg.fizanakara.api.models.Tribute;
import mg.fizanakara.api.services.TributeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admins/tributes")
@RequiredArgsConstructor
@Slf4j
public class TributeController {
    private final TributeService tributeService;

    //  🔒 ALL ROUTES IS PROTECTED BY ADMIN TOKEN
    // GET ALL
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<Tribute>> getAllTributes() {
        log.info("Recuperate all districts");
        return ResponseEntity.ok(tributeService.getAllTributes());
    }

    // GET BY ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Tribute> getTributeByID(@PathVariable Long id) {
        log.info("Recuperate district by ID {}", id);
        return ResponseEntity.ok(tributeService.getTributeByID(id));
    }

    // CREATE
    @PostMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Tribute> createTribute(@RequestBody @Validated TributeDto dto) {
        log.info("Create district {}", dto.getName());
        Tribute created = tributeService.createTribute(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // UPDATE BY ID
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Tribute> updateTribute(@PathVariable Long id, @RequestBody  @Validated TributeDto dto) {
        log.info("Update district {}", dto.getName());
        Tribute updated = tributeService.updateTribute(id, dto);
        return ResponseEntity.ok(updated);
    }

    // DELETE BY ID
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> deleteTribute(@PathVariable Long id) {
        log.info("Delete district by ID {}", id);
        tributeService.deleteTribute(id);
        return ResponseEntity.ok(Map.of("message", "Tribute deleted", "success", true));
    }

    // DELETE ALL
    @DeleteMapping("/delete-all")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> deleteAllTributes() {
        log.info("Suppression all districts)");
        return tributeService.deleteAllTributes();
    }
}
