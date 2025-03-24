package org.hoangtugio.smartwallet.repository;

import jakarta.validation.constraints.Email;
import org.hoangtugio.smartwallet.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, Integer> {
    Account getAccountById(int id);

    boolean existsAccountByEmail(@Email(message = "Email không đúng định dạng") String email);
}
