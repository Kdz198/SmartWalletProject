package org.hoangtugio.smartwallet.repository;

import org.hoangtugio.smartwallet.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category,Integer> {
    List<Category> findByAccountId(int accountId);
}
