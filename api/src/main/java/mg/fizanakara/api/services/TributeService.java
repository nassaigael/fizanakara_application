package mg.fizanakara.api.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.fizanakara.api.dto.tributes.TributeDto;
import mg.fizanakara.api.models.Tribute;
import mg.fizanakara.api.repository.TributeRepository;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TributeService {
    private final TributeRepository tributeRepository;

    // GET ALL
    public List<Tribute> getAllTributes(){
        return tributeRepository.findAll();
    }

    // GET BY ID
    public Tribute getTributeByID(Long id){
        return tributeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Tribute not found"));
    }

    // CREATE
    @Transactional
    public Tribute createTribute(TributeDto dto){
        if(tributeRepository.existsByName(dto.getName())){
            throw new IllegalArgumentException("Tribute of name " + dto.getName() + "is exist");
        }
        log.info("Creating Tribute : {}", dto.getName());
        Tribute tribute = Tribute.builder()
                .name(dto.getName())
                .build();
        return tributeRepository.save(tribute);
    }

    // UPDATE
    @Transactional
    public Tribute updateTribute(Long id, TributeDto dto){
        Tribute tribute = getTributeByID(id);
        if(!tribute.getName().equals(dto.getName()) && tributeRepository.existsByName(dto.getName())){
            throw new IllegalArgumentException("Tribute of name " + dto.getName() + " is exist");
        }
        log.info("Updating Tribute ID {} : {}", id, dto.getName());
        tribute.setName(dto.getName());
        return tributeRepository.save(tribute);
    }

    // DELETE
    @Transactional
    public void deleteTribute(Long id){
        Tribute tribute = getTributeByID(id);
        tributeRepository.delete(tribute);
    }

    // DELETE ALL
    public ResponseEntity<Map<String, Object>> deleteAllTributes() {
        tributeRepository.deleteAll();
        return ResponseEntity.ok(Map.of("message", "All districts deleted", "success", true));
    }
}
