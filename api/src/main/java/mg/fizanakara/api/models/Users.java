package mg.fizanakara.api.models;


import mg.fizanakara.api.models.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDate;

@MappedSuperclass
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class Users {
    @Id
    @Column(length = 11)
    private String id;

    @Column(name = "sequence_number", updatable = false, nullable = false)
    private Long sequenceNumber;

    @Column(name = "first_name", nullable = false, length = 250)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 250)
    private String lastName;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false, length= 10)
    private Gender gender;

    @Column(name = "image_url", nullable = false, length = 250)
    private String imageUrl;

    @Column(name = "phone_number", nullable = false, length = 13)
    private String phoneNumber;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDate createdAt;

    public abstract String generatedCustomId();
}