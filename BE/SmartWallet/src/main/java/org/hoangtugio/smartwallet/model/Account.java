package org.hoangtugio.smartwallet.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;
import org.hibernate.validator.constraints.Length;

import java.sql.Date;

@Entity
@Table(name = "Accounts")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "Name")
    @NotBlank(message = "Tên không được để trống !")
    @Nationalized
    private String name;

    @Column(name = "Pass")
    @NotBlank(message = "Mật khẩu không được để trống")
    @Length(min = 8, message = "Mật khẩu phải ít nhất 8 ký tự")
    private String pass;

    @Column(name = "Email")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
            message = "Email không đúng định dạng. Ví dụ: abc@example.com")
    private String email;

    @Column(name = "Gender")
    private boolean gender;

    @Column(name = "Dob")
    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    private Date dob;
}
