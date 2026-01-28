package mg.fizanakara.api.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    private String token;

    @OneToOne
    @JoinColumn(name = "admin_id", referencedColumnName = "id")
    private Admins admin;

    @Column(name = "expiry_date", nullable = false)
    private Instant expiryDate;
}

