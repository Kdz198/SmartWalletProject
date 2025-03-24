package org.hoangtugio.smartwallet.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Deal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;
    boolean type;
    long total;
    @Nationalized
    String description;
    java.sql.Date date;
    boolean method;
    @ManyToOne
    @JoinColumn(name = "CateId", nullable = true)
    Category category;



}
