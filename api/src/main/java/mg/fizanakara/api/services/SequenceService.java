package mg.fizanakara.api.services;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class SequenceService {

    private static final Logger log = LoggerFactory.getLogger(SequenceService.class);

    @PersistenceContext
    private EntityManager  em;

    @Transactional
    public Long getNextSequence(String seqName) {
        try {
            Long nextVal = ((Number) em.createNativeQuery("SELECT nextval('" + seqName + "')").getSingleResult()).longValue();
            log.debug("Sequence {} generated : {}", seqName, nextVal);
            return nextVal;
        } catch (Exception e) {
            log.error("Error generation sequence {} : {}", seqName, e.getMessage());
            throw new RuntimeException("Impossible to generate sequence " + seqName, e);
        }
    }
}

