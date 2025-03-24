package org.hoangtugio.smartwallet;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartWalletApplication implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(SmartWalletApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Toi Yeu SpringBoot");
    }
}
