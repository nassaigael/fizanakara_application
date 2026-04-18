package mg.fizanakara.api.dto.person;

import lombok.Data;
import mg.fizanakara.api.models.Person;
import mg.fizanakara.api.models.enums.Gender;
import mg.fizanakara.api.models.enums.MemberStatus;

import java.time.LocalDate;
import java.util.List;

@Data
public class PersonResponseDto {
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
    private boolean isActiveMember;

    private Long districtId;
    private String districtName;
    private Long tributeId;
    private String tributeName;

    private String parentId;
    private String parentName;
    private int childrenCount;
    private List<Person> children = getChildren();

    public void setIsActiveMember(boolean isActiveMember) {
        this.isActiveMember = isActiveMember;
    }
}