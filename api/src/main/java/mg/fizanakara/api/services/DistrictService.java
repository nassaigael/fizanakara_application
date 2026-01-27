package mg.fizanakara.api.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.fizanakara.api.dto.districts.DistrictDto;
import mg.fizanakara.api.models.District;
import mg.fizanakara.api.repository.DistrictRepository;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DistrictService {
    private final DistrictRepository districtRepository;

    // GET ALL
    public List<District> getAllDistricts() {
        return districtRepository.findAll();
    }

    // GET BY ID
    public District getDistrictById(Long id) {
        return districtRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("District not found with id " + id));
    }

    // CREATE
    @Transactional
    public District createDistrict(DistrictDto dto) {
        if (districtRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("District with name '" + dto.getName() + "' has exist");
        }
        log.info("Creating District : {}", dto.getName());
        District district = District.builder()
                .name(dto.getName())
                .build();
        return districtRepository.save(district);
    }

    // UPDATE BY ID
    @Transactional
    public District updateDistrict(Long id, DistrictDto dto) {
        District district = getDistrictById(id);
        if (!district.getName().equals(dto.getName()) && districtRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("District of name '" + dto.getName() + "' exist");
        }
        log.info("Updating district ID {} : {}", id, dto.getName());
        district.setName(dto.getName());
        return districtRepository.save(district);
    }

    // DELETE BY ID
    @Transactional
    public void deleteDistrict(Long id) {
        District district = getDistrictById(id);
        log.info("Suppression du district ID : {}", id);
        districtRepository.delete(district);
    }

    // DELETE ALL
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteAllDistricts() {
        districtRepository.deleteAll();
        return ResponseEntity.ok(Map.of("message", "All districts deleted", "success", true));
    }

}
