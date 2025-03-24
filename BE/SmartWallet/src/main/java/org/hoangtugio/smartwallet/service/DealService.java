package org.hoangtugio.smartwallet.service;


import org.hoangtugio.smartwallet.model.Deal;
import org.hoangtugio.smartwallet.repository.DealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DealService {

    @Autowired
    DealRepository dealRepository;

    public List<Deal> getAll()
    {
        return dealRepository.findAll();
    }

    public Deal create (Deal deal)
    {
        return dealRepository.save(deal);
    }

    public void deleteById ( int id)
    {
         dealRepository.deleteById(id);
    }

    public Deal update (Deal deal)
    {
        Deal deal1 = dealRepository.findById(deal.getId()).orElseThrow();

        return dealRepository.save(deal);
    }

    public Deal findById (int id)
    {
        return dealRepository.findById(id).orElseThrow();
    }


}
