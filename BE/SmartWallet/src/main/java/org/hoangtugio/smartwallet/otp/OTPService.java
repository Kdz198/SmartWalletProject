package org.hoangtugio.smartwallet.otp;


import lombok.RequiredArgsConstructor;
import org.hoangtugio.smartwallet.repository.AccountRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OTPService {
    private final OTPRepository otpRepository;


    // Tạo OTP mới cho khách hàng
    public String generateOTP(String email) {
        String otpCode = String.format("%06d", new Random().nextInt(1000000));

        OTP otp = new OTP();
        otp.setEmail(email);
        otp.setOtp(otpCode);
        otp.setExpiryDate(LocalDateTime.now().plusMinutes(5));
        otp.setUsed(false);

        otpRepository.save(otp);
        return otpCode;
    }

    public boolean verifyOTP(String email, String otpCode) {
        Optional<OTP> otpOptional = otpRepository.findTopByEmailAndOtpAndIsUsedFalseOrderByExpiryDateDesc(email, otpCode);

        if (otpOptional.isEmpty() || otpOptional.get().getExpiryDate().isBefore(LocalDateTime.now())) {
            return false; // Không tìm thấy hoặc hết hạn
        }

        OTP otp = otpOptional.get();
        otp.setUsed(true);
        otpRepository.save(otp);
        return true;
    }

}
