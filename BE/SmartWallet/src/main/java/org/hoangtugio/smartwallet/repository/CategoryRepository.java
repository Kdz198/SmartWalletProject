package org.hoangtugio.smartwallet.repository;

import org.hoangtugio.smartwallet.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category,Integer> {
}
