package org.hoangtugio.smartwallet.repository;

import org.hoangtugio.smartwallet.model.Deal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DealRepository extends JpaRepository<Deal,Integer> {

    List<Deal> findByAccount_Id(int accountId);

    List<Deal> findByAccountIdAndCategoryId(int accountId, int categoryId);
}
