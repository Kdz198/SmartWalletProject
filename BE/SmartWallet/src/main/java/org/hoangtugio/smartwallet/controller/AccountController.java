package org.hoangtugio.smartwallet.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import org.hoangtugio.smartwallet.model.Account;
import org.hoangtugio.smartwallet.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/account")
@CrossOrigin(origins = "*")
public class AccountController {
    @Autowired
    private AccountService accountService;


    @GetMapping
    public List<Account> getAccounts() {
        return accountService.getAllAccounts();
    }

    @PostMapping("save")
    public Account saveAccount(@RequestBody @Valid Account account) {
        return accountService.save(account);
    }

    @GetMapping("findbyid")
    public Account getAccountById(@RequestParam int id) {
        return accountService.getAccountById(id);
    }

    @PostMapping("update")
    public Account updateAccount(@RequestBody @Valid Account account) {
        return accountService.updateAccount(account);
    }

    @DeleteMapping("delete")
    public void deleteAccount(@RequestParam int id) {
        accountService.deleteAccount(id);
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) {
            Account account = accountService.findByEmail(userDetails.getUsername());
            if (account != null) {
                return ResponseEntity.ok(new UserResponse(account.getId(), account.getEmail(), "ROLE_USER"));
            }
        }
        return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body("Not logged in");
    }

    // Ky thuat dung Record de thuc hien Hoa DTO ma khong can phai tao 1 class rieng biet
    private record UserResponse(int id, String email, String roleUser) {}
}
