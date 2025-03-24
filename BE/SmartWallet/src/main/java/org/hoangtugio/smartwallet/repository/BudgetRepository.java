package org.hoangtugio.smartwallet.repository;

import jakarta.validation.constraints.NotNull;
import org.hoangtugio.smartwallet.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Integer> {
    List<Budget> findByAccountId(int accountId);

    List<Budget> findAllByMonthAndAccountId(int month, int accountId);

    List<Budget> findAllByTypeAndAccount_Id(boolean type, int accountId);
}
