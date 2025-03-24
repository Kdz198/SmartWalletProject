package org.hoangtugio.smartwallet.otp;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OTPRepository extends JpaRepository<OTP,Long> {
    Optional<OTP> findTopByEmailAndOtpAndIsUsedFalseOrderByExpiryDateDesc(String email, String otpCode);
}
