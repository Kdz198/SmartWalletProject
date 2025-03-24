package org.hoangtugio.smartwallet.repository;

import org.hoangtugio.smartwallet.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findAllByAccount_Id(int accountId);
}
