package mg.fizanakara.api.components;

import jakarta.persistence.PrePersist;
import lombok.RequiredArgsConstructor;
import mg.fizanakara.api.models.Users;
import mg.fizanakara.api.services.SequenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserPrePersisteListener {
    @Autowired
    private SequenceService sequenceService;

    @PrePersist
    public void prePersistUsers(Users user) {
        if (user.getSequenceNumber() == null) {
            user.setSequenceNumber(sequenceService.getNextSequence("mbr_seq"));
        }
        if (user.getId() == null) {
            user.setId(user.generatedCustomId());
        }
    }
}
