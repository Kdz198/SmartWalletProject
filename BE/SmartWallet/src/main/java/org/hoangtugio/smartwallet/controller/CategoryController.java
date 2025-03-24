package org.hoangtugio.smartwallet.controller;


import org.hoangtugio.smartwallet.model.Category;
import org.hoangtugio.smartwallet.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
public class CategoryController {


    @Autowired
    CategoryService categoryService;

    @GetMapping
    public List<Category> getAll()
    {
        return categoryService.getAll();
    }

    @PostMapping("/create")
    public Category create ( @RequestBody Category category)
    {
        return categoryService.create(category);
    }

    @PostMapping("/update")
    public Category update ( @RequestBody Category category)
    {
        return categoryService.update(category);
    }

    @DeleteMapping("/delete")
    public void deleteById ( @RequestParam int id)
    {
        categoryService.deleteById(id);
    }

    @GetMapping("/findbyaccountid")
    public List<Category> findByAccountId ( @RequestParam int accountId)
    {
        return categoryService.showCateByAccountId(accountId);
    }


}
