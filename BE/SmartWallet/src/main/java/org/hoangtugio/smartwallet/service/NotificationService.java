package org.hoangtugio.smartwallet.service;

import org.hoangtugio.smartwallet.exception.CustomException;
import org.hoangtugio.smartwallet.model.Account;
import org.hoangtugio.smartwallet.model.Notification;
import org.hoangtugio.smartwallet.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    public Notification save(Account acc,int money, boolean method) {
        Notification notification = new Notification();
        notification.setAccount(acc);
        if(method) {
            notification.setTittle("Cảnh báo vượt quá chi tiêu !!");
            notification.setMessage("Bạn đã vượt quá số tiền là: " + money + " so với chi tiêu của mục tiêu đặt ra rồi. Hãy chú ý chi tiêu nhé !!");
        }
        else {
            notification.setTittle("Chúc mừng bạn đã đạt được mục tiêu !!");
            notification.setMessage("Bạn đã hòan thành tốt mục tiêu tiết kiệm và hơn so với mục tiêu đặt ra với số tiền là: " + money + " so với mục tiêu của ngân sách đặt ra rồi. Chúc mừng nhé !!");
        }
        return notificationRepository.save(notification);
    }

    public List<Notification> findByAccountId(int accId) {
        return notificationRepository.findAllByAccount_Id(accId);
    }

    public Notification findById(int id) {
        return notificationRepository.findById(id).orElse(null);
    }

    public void readNotification(int id) {
        Notification noti = findById(id);
        if (noti != null) {
            if(!noti.isRead()){
                noti.setRead(true);
                notificationRepository.save(noti);
            }
        }
    }

}
