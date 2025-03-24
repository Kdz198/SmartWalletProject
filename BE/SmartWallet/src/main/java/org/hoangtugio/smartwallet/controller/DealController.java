package org.hoangtugio.smartwallet.controller;


import org.hoangtugio.smartwallet.model.Deal;
import org.hoangtugio.smartwallet.service.DealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transaction")
public class DealController {

    @Autowired
    DealService dealService;

    @GetMapping
    public List<Deal> getAll()
    {
        return dealService.getAll();
    }

    @PostMapping("/create")
    public Deal create (Deal deal)
    {
        return dealService.create(deal);
    }

    @PostMapping("/update")
    public Deal update (Deal deal)
    {
        return dealService.update(deal);
    }

    @GetMapping("/find")
    public Deal findById (int id)
    {
        return dealService.findById(id);
    }

}
