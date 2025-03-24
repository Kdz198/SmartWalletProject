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
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "Name")
    @Nationalized
    private String name;

    //1:pay
    //2:earn
    @NotNull(message = "Type không được để trống")
    private boolean type;

    @Positive(message = "Total phải là số dương")
    private long total;

    @NotNull(message = "Month không được để trống")
    private int month;

    @ManyToOne
    @JoinColumn(name = "AccountId",nullable = false)
    Account account;
}
