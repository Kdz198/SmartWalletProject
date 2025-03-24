package org.hoangtugio.smartwallet.security;


import org.hoangtugio.smartwallet.exception.CustomException;
import org.hoangtugio.smartwallet.model.Account;
import org.hoangtugio.smartwallet.repository.AccountRepository;
import org.hoangtugio.smartwallet.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    AccountRepository accountRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        Account account = accountRepository.findByEmail(email);
        if (account == null) {
            throw new CustomException("User not found with email: ", HttpStatus.BAD_REQUEST);
        }
        return User.builder()
                .username(account.getEmail())
                .password(account.getPass())
                .roles("USER")
                .build();
    }
}
