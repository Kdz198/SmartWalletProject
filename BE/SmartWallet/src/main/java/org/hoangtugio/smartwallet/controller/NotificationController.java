package org.hoangtugio.smartwallet.controller;

import org.hoangtugio.smartwallet.model.Notification;
import org.hoangtugio.smartwallet.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notification")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<Notification> getNotificationsByAccount(@RequestParam int id ) {
        return notificationService.findByAccountId(id);
    }

    @GetMapping("findbyid")
    public Notification getNotificationById(@RequestParam int notificationId) {
        return notificationService.findById(notificationId);
    }

    @GetMapping("read")
    public void readNotification(@RequestParam int notificationId) {
        notificationService.readNotification(notificationId);
    }

}
