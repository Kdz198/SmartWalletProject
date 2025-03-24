package org.hoangtugio.smartwallet.service;


import org.hoangtugio.smartwallet.exception.CustomException;
import org.hoangtugio.smartwallet.model.Budget;
import org.hoangtugio.smartwallet.model.Deal;
import org.hoangtugio.smartwallet.repository.DealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DealService {

    @Autowired
    DealRepository dealRepository;
    @Autowired
    NotificationService notificationService;
    @Autowired
    private BudgetService budgetService;

    public List<Deal> getAll()
    {
        return dealRepository.findAll();
    }

    @Transactional
    public Deal create (Deal deal)
    {
        Deal saved = dealRepository.save(deal);
        Budget budget = budgetService.getBudgetById(saved.getBudget().getId());
        System.out.println("Total budget:"+budget.getTotal());
        System.out.println("Actual total:"+caculateActualTotalInBudget(deal.getBudget().getId(),deal.getAccount().getId()));
        if(budget != null) {
            if (budget.getTotal() <= caculateActualTotalInBudget(deal.getBudget().getId(), deal.getAccount().getId())) {
                int money = (int) (caculateActualTotalInBudget(deal.getBudget().getId(), deal.getAccount().getId()) - budget.getTotal());
                System.out.println(money);
                notificationService.save(saved.getAccount(), money);
            }
        }
        return saved;
    }

    public void deleteById ( int id)
    {
        if(!dealRepository.existsById(id)){
            throw new CustomException("Deal không tồn tại !!", HttpStatus.BAD_REQUEST);
        }
        else dealRepository.deleteById(id);
    }

    @Transactional
    public Deal update (Deal deal)
    {
        if (!dealRepository.existsById(deal.getId()))
        {
            throw new CustomException("Deal không tồn tại !!", HttpStatus.CONFLICT);
        }
        Deal saved = dealRepository.save(deal);
        Budget budget = budgetService.getBudgetById(saved.getBudget().getId());
        System.out.println("Total budget:"+budget.getTotal());
        System.out.println("Actual total:"+caculateActualTotalInBudget(deal.getBudget().getId(),deal.getAccount().getId()));
        if(budget.getTotal()<= caculateActualTotalInBudget(deal.getBudget().getId(),deal.getAccount().getId())){

            int money = (int) (caculateActualTotalInBudget(deal.getBudget().getId(),deal.getAccount().getId()) - budget.getTotal());
            System.out.println("Số tiền quá:"+money);
            notificationService.save(saved.getAccount(),money);
        }
        return saved;
    }

    public Deal findById (int id)
    {
        if(!dealRepository.existsById(id)){
            throw new CustomException("Deal không tồn tại !!", HttpStatus.BAD_REQUEST);
        }
        return dealRepository.findById(id).orElseThrow();
    }

    public List<Deal> findByAccountId ( int accountId)
    {
        return dealRepository.findByAccount_Id(accountId);
    }

    public List<Deal> findByAccountIDAndCateId ( int accountId, int cateId)
    {
        return dealRepository.findByAccountIdAndCategoryId(accountId, cateId);
    }

    public List<Deal> fillterByType(boolean type){
        return dealRepository.findByType(type);
    }

    public List<Deal> findByBudgetAndAccount(int budgetId,int accountId){
        return dealRepository.findAllByBudget_IdAndAccount_Id(budgetId,accountId);
    }

    public int caculateActualTotalInBudget(int budget,int account){
        int actualTotal = 0;
        for(Deal deal : dealRepository.findAllByBudget_IdAndAccount_Id(budget,account)){
            actualTotal += deal.getTotal();
        }
        return actualTotal;
    }

}
