package org.hoangtugio.smartwallet.model;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.sql.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Deal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;


    //true:pay
    //false:earn
    @NotNull(message = "Type không được để trống")
    private boolean type;

    @Positive(message = "Total phải là số dương")
    private int total;

    @Nationalized
    private String description;

    @NotNull(message = "Date không được để trống")
    private Date date;

    @NotNull(message = "Method không được để trống")
    private boolean method;

    @ManyToOne
    @JoinColumn(name = "CateId", nullable = true)
    private Category category;

    @ManyToOne
    @JoinColumn(name = "AccountId",nullable = false)
    Account account;

    @ManyToOne
    @JoinColumn(name = "BudgetId",nullable = true)
    Budget budget;

}
