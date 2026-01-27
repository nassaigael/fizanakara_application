package mg.fizanakara.api.dto.person;

import lombok.Data;  // ← ASSURE : Génère getters/setters/toString/equals
import mg.fizanakara.api.models.Person;
import mg.fizanakara.api.models.enums.Gender;
import mg.fizanakara.api.models.enums.MemberStatus;

import java.time.LocalDate;
import java.util.List;

@Data  // ← FIX : Génère setIsActiveMember, etc.
public class PersonResponseDto {  // Output unifié
    private String id;
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private Gender gender;
    private String imageUrl;
    private String phoneNumber;
    private LocalDate createdAt;
    private Long sequenceNumber;
    private MemberStatus status;
    private boolean isActiveMember;  // ← SETTER GÉNÉRÉ PAR @Data

    // Liens géo/événementiels (comme avant)
    private Long districtId;
    private String districtName;
    private Long tributeId;
    private String tributeName;

    // Hiérarchie (nouveau)
    private String parentId;  // Lien vers parent
    private String parentName;  // Nom concat parent
    private int childrenCount;  // Nombre d'enfants directs
    private List<Person> children = getChildren();

    public void setIsActiveMember(boolean isActiveMember) {
        this.isActiveMember = isActiveMember;
    }
}