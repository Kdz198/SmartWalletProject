package org.hoangtugio.smartwallet;

import org.hoangtugio.smartwallet.model.Account;
import org.hoangtugio.smartwallet.model.Category;
import org.hoangtugio.smartwallet.service.AccountService;
import org.hoangtugio.smartwallet.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.sql.Date;

@SpringBootApplication
public class SmartWalletApplication implements CommandLineRunner {

    @Autowired
    AccountService accountService;
    @Autowired
    CategoryService categoryService;

    public static void main(String[] args) {
        SpringApplication.run(SmartWalletApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Toi Yeu SpringBoot");


        Account account = new Account( "Hoang Tu Gio", "12345678", "khangqhse184031@fpt.edu.vn", true, Date.valueOf("2004-08-19"));
        accountService.save(account);

        Category category = new Category("Ăn Uống","food.img",null);
        Category category1 = new Category("Sinh Họat","food.img",null);
        Category category2 = new Category("Mua Sắm","food.img",null);
        Category category3 = new Category("Học Tập","food.img",null);
        Category category4 = new Category("Giải Trí","food.img",null);
        Category category5 = new Category("Du Lịch","food.img",null);
        Category category6 = new Category("Sức Khỏe","food.img",null);
        Category category7 = new Category("Coffe","food.img",null);


        categoryService.create(category);
        categoryService.create(category1);
        categoryService.create(category2);
        categoryService.create(category3);
        categoryService.create(category4);
        categoryService.create(category5);
        categoryService.create(category6);
        categoryService.create(category7);

    }
}
