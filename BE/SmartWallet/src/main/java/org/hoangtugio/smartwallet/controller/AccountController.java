package org.hoangtugio.smartwallet.controller;

import jakarta.validation.Valid;
import org.hoangtugio.smartwallet.model.Account;
import org.hoangtugio.smartwallet.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/account")
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
}
