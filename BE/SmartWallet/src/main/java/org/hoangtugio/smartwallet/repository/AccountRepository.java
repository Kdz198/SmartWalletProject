package org.hoangtugio.smartwallet.repository;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import org.hoangtugio.smartwallet.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Integer> {
    Account getAccountById(int id);

    boolean existsAccountByEmail(@Email(message = "Email không đúng định dạng") String email);

    Account findByEmail(@Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
            message = "Email không đúng định dạng. Ví dụ: abc@example.com") String email);
}
