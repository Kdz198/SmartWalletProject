package org.hoangtugio.smartwallet.service;


import org.hoangtugio.smartwallet.model.Category;
import org.hoangtugio.smartwallet.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
        categoryRepository.deleteById(id);
    }

    public Category update ( Category category)
    {
        Category category1 = categoryRepository.findById(category.getId()).orElseThrow();
        return categoryRepository.save(category);
    }

}
