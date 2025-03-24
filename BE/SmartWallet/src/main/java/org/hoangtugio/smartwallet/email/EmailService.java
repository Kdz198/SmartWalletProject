package org.hoangtugio.smartwallet.email;


import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;


    public void sendEmail(String to, String subject, String body) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("your-email@gmail.com"); // Email gửi đi
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, true); // true: gửi email dạng HTML

        mailSender.send(message);
    }

    public void sendOtpEmail(String to, String otp) throws MessagingException {
        String subject = "Mã OTP Xác Nhận Của Bạn";
        String body = "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<style>" +
                "@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }" +
                "@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }" +
                "@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }" +
                "</style>" +
                "</head>" +
                "<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f0f4f8;'>" +
                "<div style='max-width: 600px; margin: 20px auto; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); " +
                "border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden; animation: fadeIn 1s ease-in;'>"

                // Header
                + "<div style='background: linear-gradient(to right, #06b6d4, #0891b2); padding: 25px; text-align: center; color: white;'>" +
                "<h1 style='margin: 0; font-size: 26px; font-weight: 600; animation: slideUp 0.8s ease-out;'>" +
                "🔒 Mã OTP Của Bạn" +
                "</h1>" +
                "<p style='margin: 8px 0 0; font-size: 16px; opacity: 0.9;'>Vui lòng sử dụng mã dưới đây để xác nhận.</p>" +
                "</div>"

                // Main Content
                + "<div style='padding: 30px; color: #333; line-height: 1.6;'>" +
                "<p style='font-size: 16px; animation: slideUp 1s ease-out;'>Chào bạn,</p>" +
                "<p style='font-size: 16px; animation: slideUp 1.2s ease-out;'>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Đây là mã OTP của bạn:</p>" +
                "<div style='text-align: center; margin: 25px 0; animation: slideUp 1.4s ease-out;'>" +
                "<span style='display: inline-block; background: #e0f2fe; padding: 15px 30px; font-size: 28px; font-weight: bold; " +
                "color: #0d9488; border-radius: 8px; letter-spacing: 3px; box-shadow: 0 2px 10px rgba(13,148,136,0.2);'>" + otp + "</span>" +
                "</div>" +
                "<p style='font-size: 14px; color: #555; animation: slideUp 1.6s ease-out;'>" +
                "Mã này có hiệu lực trong <b style='color: #d97706;'>10 phút</b>. Vui lòng không chia sẻ mã này với bất kỳ ai để bảo vệ tài khoản của bạn.</p>" +
                "<p style='font-size: 14px; color: #555; animation: slideUp 1.8s ease-out;'>" +
                "Nếu bạn không yêu cầu mã này, hãy liên hệ ngay với chúng tôi qua " +
                "<a href='mailto:support@healthcare.com' style='color: #0891b2; text-decoration: none; font-weight: bold;'>support@healthcare.com</a>.</p>" +
                "</div>"

                // Footer (Updated to match your image)
                + "<div style='background: #1e293b; color: #ffffff; padding: 20px; text-align: center; font-size: 13px; border-radius: 0 0 12px 12px;'>" +
                "<p style='margin: 0; font-weight: 600; font-size: 15px; color: #ffffff;'>" + "Healthcare Service" + "</p>" +
                "<p style='margin: 5px 0; color: #ffffff;'>" + "123 Đường Sức Khỏe, TP. HCM, Việt Nam" + "</p>" +
                "<p style='margin: 5px 0;'>" +
                "📧 <a href='mailto:support@healthcare.com' style='color: #22d3ee; text-decoration: none;'>" + "support@healthcare.com" + "</a> " +
                "| 📞 <b style='color: #22d3ee;'>+84 123 456 789</b>" +
                "</p>" +
                "<p style='margin: 10px 0 0; color: #a0aec0; font-size: 12px;'>© 2025 Healthcare Service. Bảo lưu mọi quyền.</p>" +
                "<p style='margin: 5px 0; color: #a0aec0; font-size: 11px;'>Email tự động, vui lòng không trả lời trực tiếp.</p>" +
                "</div>"

                + "</div>" +
                "</body>" +
                "</html>";

        sendEmail(to, subject, body);
    }



}
