package org.hoangtugio.smartwallet.otp;


import jakarta.mail.MessagingException;
import org.hoangtugio.smartwallet.email.EmailService;
import org.hoangtugio.smartwallet.model.Account;
import org.hoangtugio.smartwallet.repository.AccountRepository;
import org.hoangtugio.smartwallet.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/otp")
public class OTPController {

    @Autowired
    OTPService otpService;
    @Autowired
    AccountRepository accountRepository;
    @Autowired
    EmailService emailService;
    @Autowired
    OTPRepository otpRepository;

    @PostMapping("/send")
    public String sendOtp(@RequestParam String email) {
        Account account = accountRepository.findByEmail(email);
        if (account == null) {
            return "Invalid email";
        }

        String otp = otpService.generateOTP(account.getEmail());
        try {
            emailService.sendOtpEmail(email, otp);
            return "OTP sent successfully";
        } catch (MessagingException e) {
            return "Failed to send OTP";
        }
    }

    @GetMapping("/verify")
    public String verifyOtp(@RequestParam String email, @RequestParam String otp) {
        Account account = accountRepository.findByEmail(email);
        if (account==null) {
            return "Invalid email";
        }

        boolean isValid = otpService.verifyOTP(account.getEmail(), otp);
        return isValid ? "OTP verified successfully" : "Invalid or expired OTP";
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestParam String email,@RequestParam String otp, @RequestParam String newPassword) {
        Account account = accountRepository.findByEmail(email);
        if (account == null) {
            return "Invalid email";
        }
        Optional<OTP> otpreal = otpRepository.findTopByEmailOrderByExpiryDateDesc(email);
        if (!otpreal.get().getOtp().equals(otp)) {
            return "Invalid OTP";
        }
        account.setPass(newPassword);
        accountRepository.save(account);
        return "Password reset successfully";
    }




}
