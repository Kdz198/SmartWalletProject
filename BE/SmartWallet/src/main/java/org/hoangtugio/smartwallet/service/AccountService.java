package org.hoangtugio.smartwallet.service;

import org.hoangtugio.smartwallet.exception.CustomException;
import org.hoangtugio.smartwallet.model.Account;
import org.hoangtugio.smartwallet.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountService {
    @Autowired
    private AccountRepository accountRepository;

    public Account save(Account account) {
        if(accountRepository.existsAccountByEmail(account.getEmail())) {
            throw new CustomException("Email đã tồn tại !!", HttpStatus.CONFLICT);
        }
        return accountRepository.save(account);
    }

    public Account getAccountById(int id){
        if(!accountRepository.existsById(id)){
            throw new CustomException("Account không tồn tại !!",HttpStatus.BAD_REQUEST);
        }
        return accountRepository.getAccountById(id);
    }

    public List<Account> getAllAccounts(){
        return accountRepository.findAll();
    }

    public Account updateAccount(Account account){
        if(accountRepository.getAccountById(account.getId()) != null){
            if(!accountRepository.existsAccountByEmail(account.getEmail())) {
                return accountRepository.save(account);
            }
            else throw new CustomException("Email đã tồn tại !!", HttpStatus.CONFLICT);
        }
        else throw new CustomException("Account không tồn tại !!",HttpStatus.BAD_REQUEST);
    }

    public void deleteAccount(int id){
        if(accountRepository.existsById(id)){
            accountRepository.deleteById(id);
        }
        else throw new CustomException("Account không tồn tại !!",HttpStatus.BAD_REQUEST);
    }
}
