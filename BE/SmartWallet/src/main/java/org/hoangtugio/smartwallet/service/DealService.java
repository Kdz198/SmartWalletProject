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

        //Nếu tạo dela mà thêm vào budget luôn thì xét coi là tổng số tiền của deal trong budget có lớn hơn mục tiêu của budget hay không

        if(deal.getBudget()!=null) {

            Budget budget = budgetService.getBudgetById(saved.getBudget().getId());
            if (budget.getTotal() <= caculateActualTotalInBudget(deal.getBudget().getId(), deal.getAccount().getId())) {
                int money = (int) (caculateActualTotalInBudget(deal.getBudget().getId(), deal.getAccount().getId()) - budget.getTotal());
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

    //Hàm này thực chất là hành động thêm deal vào budget
    //xét coi là tổng số tiền của deal trong budget có lớn hơn mục tiêu của budget hay không
    @Transactional
    public Deal update (Deal deal)
    {
        if (!dealRepository.existsById(deal.getId()))
        {
            throw new CustomException("Deal không tồn tại !!", HttpStatus.CONFLICT);
        }
        Deal saved = dealRepository.save(deal);
        Budget budget = budgetService.getBudgetById(saved.getBudget().getId());
        if(budget.getTotal()<= caculateActualTotalInBudget(deal.getBudget().getId(),deal.getAccount().getId())){

            int money = (int) (caculateActualTotalInBudget(deal.getBudget().getId(),deal.getAccount().getId()) - budget.getTotal());
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
