package org.hoangtugio.smartwallet.otp;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OTP {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String email;
    @Column(nullable = false, length = 6)
    private String otp;
    @Column(nullable = false)
    private LocalDateTime expiryDate;
    @Column(nullable = false)
    private boolean isUsed = false;


}
