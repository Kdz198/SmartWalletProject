package org.hoangtugio.smartwallet.controller;

import jakarta.validation.Valid;
import org.hoangtugio.smartwallet.model.Budget;
import org.hoangtugio.smartwallet.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {
    @Autowired
    private BudgetService budgetService;

    @GetMapping
    public List<Budget> getAll(){
        return budgetService.getAllBudgets();
    }

    @GetMapping("findbyid")
    public Budget getBudgetById(@RequestParam int id){
        return budgetService.getBudgetById(id);
    }

    @PostMapping("create")
    public Budget saveBudget(@RequestBody @Valid Budget budget){
        return budgetService.save(budget);
    }

    @PostMapping("update")
    public Budget updateBudget(@RequestBody @Valid Budget budget){
        return budgetService.update(budget);
    }

    @DeleteMapping("delete")
    public void deleteBudget(@RequestParam int id){
        budgetService.delete(id);
    }

    @GetMapping("findbyaccount")
    public List<Budget> getBudgetByAccount(@RequestParam int id){
        return budgetService.getBudgetsByAccountId(id);
    }

    @GetMapping("findbymonthandaccount")
    public List<Budget> getBudgetByAccount(@RequestParam int month,@RequestParam int id){
        return budgetService.getBudgetsByMonthAndAccount(month, id);
    }

    @GetMapping("findbytypeandaccount")
    public List<Budget> getBudgetByTypeAndAccountId(@RequestParam boolean type,@RequestParam int id){
        return budgetService.getByTypeAndAccount(type, id);
    }
}
