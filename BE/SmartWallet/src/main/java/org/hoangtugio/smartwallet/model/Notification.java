package org.hoangtugio.smartwallet.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.sql.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Nationalized
    @Column(name = "Tittle")
    private String tittle;

    @Nationalized
    @Column(name = "Message")
    private String message;

    @Column(name = "isRead")
    boolean isRead = false;

    @ManyToOne
    @JoinColumn(name = "AccountId",nullable = true)
    Account account;
}
