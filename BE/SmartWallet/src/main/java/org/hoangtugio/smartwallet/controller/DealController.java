package org.hoangtugio.smartwallet.controller;


import jakarta.validation.Valid;
import org.hoangtugio.smartwallet.model.Deal;
import org.hoangtugio.smartwallet.service.DealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deal")
@CrossOrigin(origins = "*")
public class DealController {

    @Autowired
    DealService dealService;

    @GetMapping
    public List<Deal> getAll()
    {
        return dealService.getAll();
    }

    @PostMapping("/create")
    public Deal create (@RequestBody @Valid Deal deal)
    {
        return dealService.create(deal);
    }

    @PostMapping("/update")
    public Deal update (@RequestBody @Valid Deal deal)
    {
        return dealService.update(deal);
    }

    @GetMapping("/find")
    public Deal findById (@RequestParam int id)
    {
        return dealService.findById(id);
    }

    @DeleteMapping("/delete")
    public void delete(@RequestParam int id){
        dealService.deleteById(id);
    }

    @GetMapping("/findbyaccount")
    public List<Deal> findByAccountId ( @RequestParam int id)
    {
        return dealService.findByAccountId(id);
    }

    @GetMapping("/findbyaccountandcate")
    public List<Deal> findByAccountIDandCateId ( @RequestParam int accountId, int CateId)
    {
        return dealService.findByAccountIDAndCateId(accountId, CateId);
    }

    @GetMapping("findbytype")
    public List<Deal> findByType(@RequestParam boolean type){
        return dealService.fillterByType(type);
    }

    @GetMapping("findbybudgetandaccount")
    public List<Deal> findByBudgetId(@RequestParam int id,@RequestParam int accountId){
        return dealService.findByBudgetAndAccount(id, accountId);
    }
}
