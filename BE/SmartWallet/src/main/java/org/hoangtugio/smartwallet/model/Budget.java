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
    //0:earn
    @NotNull(message = "Type không được để trống")
    private boolean type;

    @Positive(message = "Total phải là số dương")
    private long total;

    @NotNull(message = "Month không được để trống")
    private int month;

    @ManyToOne
    @JoinColumn(name = "AccountId",nullable = false)
    Account account;

    public Budget(String name, boolean type, long total, int month, Account account) {
        this.name = name;
        this.type = type;
        this.total = total;
        this.month = month;
        this.account = account;
    }
}
