package org.hoangtugio.smartwallet;

import org.hoangtugio.smartwallet.model.Account;
import org.hoangtugio.smartwallet.model.Budget;
import org.hoangtugio.smartwallet.model.Category;
import org.hoangtugio.smartwallet.model.Deal;
import org.hoangtugio.smartwallet.service.AccountService;
import org.hoangtugio.smartwallet.service.BudgetService;
import org.hoangtugio.smartwallet.service.CategoryService;
import org.hoangtugio.smartwallet.service.DealService;
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
    @Autowired
    private BudgetService budgetService;
    @Autowired
    private DealService dealService;

    public static void main(String[] args) {
        SpringApplication.run(SmartWalletApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Toi Yeu SpringBoot");


        Account account = new Account( "Hoang Tu Gio", "12345678", "khangqhse184031@fpt.edu.vn", true, Date.valueOf("2004-08-19"));
        accountService.save(account);
        Account acc1=new Account("Nguyen Pham Thu Ha","12345678","nha3697@gmail.com", true, Date.valueOf("2004-08-19"));
        accountService.save(acc1);

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

        Budget b = new Budget("Tiet kiem",false,5000000,4,account);
        Budget b1 = new Budget("Di choi He",true,500000,5,account);

        Budget b2 = new Budget("Mua Nha",false,50000000,4,acc1);

        Budget b3 = new Budget("Mua sam",true,1500000,4,acc1);

        budgetService.save(b);
        budgetService.save(b1);
        budgetService.save(b2);
        budgetService.save(b3);


        Deal d1 = new Deal(true,100000,"Ca phe",Date.valueOf("2025-02-02"),true,category1,acc1,null);

        Deal d2 = new Deal(false,200000,"An sang",Date.valueOf("2025-02-02"),true,category,account,b2);
        Deal d3 = new Deal(false,400000,"Luong",Date.valueOf("2025-02-02"),true,category1,acc1,null);
        Deal d4 = new Deal(true,100000,"Xem phim",Date.valueOf("2025-02-02"),true,category5,acc1,b1);

        dealService.create(d1);
        dealService.create(d2);
        dealService.create(d3);
        dealService.create(d4);

    }
}
