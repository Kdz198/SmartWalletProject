package org.hoangtugio.smartwallet.service;


import org.hoangtugio.smartwallet.exception.CustomException;
import org.hoangtugio.smartwallet.model.Deal;
import org.hoangtugio.smartwallet.repository.DealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
        if(!dealRepository.existsById(id)){
            throw new CustomException("Deal không tồn tại !!", HttpStatus.BAD_REQUEST);
        }
        else dealRepository.deleteById(id);
    }

    public Deal update (Deal deal)
    {
        if (!dealRepository.existsById(deal.getId()))
        {
            throw new CustomException("Deal không tồn tại !!", HttpStatus.CONFLICT);
        }
        return dealRepository.save(deal);
    }

    public Deal findById (int id)
    {
        if(!dealRepository.existsById(id)){
            throw new CustomException("Deal không tồn tại !!", HttpStatus.BAD_REQUEST);
        }
        return dealRepository.findById(id).orElseThrow();
    }


}
