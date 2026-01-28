package mg.fizanakara.api.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.fizanakara.api.dto.districts.DistrictDto;
import mg.fizanakara.api.models.District;
import mg.fizanakara.api.services.DistrictService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admins/districts")
@RequiredArgsConstructor
@Slf4j
public class DistrictController {
    private final DistrictService districtService;

    //  🔒 ALL ROUTES IS PROTECTED BY ADMIN TOKEN
    // GET ALL
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<District>> getAllDistricts() {
        log.info("Récupération de tous les districts");
        return ResponseEntity.ok(districtService.getAllDistricts());
    }

    // GET BY ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<District> getDistrictById(@PathVariable Long id) {
        log.debug("Récupération du district ID : {}", id);
        return ResponseEntity.ok(districtService.getDistrictById(id));
    }

    // CREATE
    @PostMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<District> createDistrict(@RequestBody @Validated DistrictDto dto) {
        log.info("Created district : {}", dto.getName());
        District created = districtService.createDistrict(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // UPDATE BY ID
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<District> updateDistrict(@PathVariable Long id, @RequestBody @Validated DistrictDto dto) {
        log.info("Updated district ID {} : {}", id, dto.getName());
        District updated = districtService.updateDistrict(id, dto);
        return ResponseEntity.ok(updated);
    }

    // DELETE BY ID
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> deleteDistrict(@PathVariable Long id) {
        log.info("Deleted district ID : {}", id);
        districtService.deleteDistrict(id);
        return ResponseEntity.ok(Map.of("message", "District deleted", "success", true));
    }

    // DELETE ALL
    @DeleteMapping("/delete-all")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> deleteAllDistricts() {
        log.info("Suppression all districts)");
        return districtService.deleteAllDistricts();
    }
}