package org.hoangtugio.smartwallet.service;

import org.hoangtugio.smartwallet.exception.CustomException;
import org.hoangtugio.smartwallet.model.Budget;
import org.hoangtugio.smartwallet.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BudgetService {
    @Autowired
    private BudgetRepository budgetRepository;

    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    public Budget getBudgetById(int id) {
        return budgetRepository.findById(id).orElseThrow();
    }

    public Budget save(Budget budget) {
        if(budgetRepository.existsById(budget.getId())) {
            throw new CustomException("Budget đã tồn tại !!", HttpStatus.BAD_REQUEST);
        }
        return budgetRepository.save(budget);
    }

    public Budget update(Budget budget) {
        if(budgetRepository.existsById(budget.getId())) {
            return budgetRepository.save(budget);
        }
        else throw new CustomException("Budget không tồn tại !!", HttpStatus.BAD_REQUEST);
    }

    public void delete(int id) {
        if(budgetRepository.existsById(id)) {
            budgetRepository.deleteById(id);
        }
        else throw new CustomException("Budget không tồn tại !!", HttpStatus.BAD_REQUEST);
    }

    public List<Budget> getBudgetsByAccountId(int accountId) {
        return budgetRepository.findByAccountId(accountId);
    }

    public List<Budget> getBudgetsByMonthAndAccount(int month,int accountId) {
        return budgetRepository.findAllByMonthAndAccountId(month,accountId);
    }

    public List<Budget> getByTypeAndAccount(boolean type,int id){
        return budgetRepository.findAllByTypeAndAccount_Id(type,id);
    }
}
