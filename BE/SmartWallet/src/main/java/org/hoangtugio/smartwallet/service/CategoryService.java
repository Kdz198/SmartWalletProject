package org.hoangtugio.smartwallet.service;


import org.hoangtugio.smartwallet.exception.CustomException;
import org.hoangtugio.smartwallet.model.Category;
import org.hoangtugio.smartwallet.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    CategoryRepository categoryRepository;

    public List<Category> getAll()
    {
        return categoryRepository.findAll();
    }

    public Category create ( Category category)
    {
        return categoryRepository.save(category);
    }

    public void deleteById ( int id)
    {
        if(!categoryRepository.existsById(id)){
            throw new CustomException("Id không tồn tại !!", HttpStatus.BAD_REQUEST);
        }
        else categoryRepository.deleteById(id);
    }

    public Category update ( Category category)
    {

        if(!categoryRepository.existsById(category.getId())){
            throw new CustomException("Category không tồn tại !!", HttpStatus.BAD_REQUEST);
        }
        else return categoryRepository.save(category);
    }

    public Category getById(int id){
        return categoryRepository.findById(id).orElseThrow();
    }

}
