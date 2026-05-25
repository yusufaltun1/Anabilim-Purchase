package com.anabilim.purchase.config;

import com.anabilim.purchase.entity.Category;
import com.anabilim.purchase.entity.User;
import com.anabilim.purchase.repository.CategoryRepository;
import com.anabilim.purchase.repository.UserRepository;
import com.anabilim.purchase.service.CategoryStockService;
import com.anabilim.purchase.service.MailService;
import com.anabilim.purchase.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CategoryLowStockNotificationJob {

    private final CategoryRepository categoryRepository;
    private final CategoryStockService categoryStockService;
    private final NotificationService notificationService;
    private final MailService mailService;
    private final UserRepository userRepository;

    @Value("${inventory.low-stock.notification-email:bilgiislem@anabilim.k12.tr}")
    private String notificationEmail;

    @Value("${inventory.low-stock.notify-role:BILGI_ISLEM_DEPARTMANI}")
    private String notifyRole;

    /** Her gün 08:00 — kategori minimum stok bildirimi */
    @Scheduled(cron = "0 0 8 * * *", zone = "Europe/Istanbul")
    @Transactional
    public void runDailyLowStockCheck() {
        log.info("Kategori düşük stok kontrolü başladı.");
        List<Category> categories = categoryRepository.findByMinStockNotifyAtIsNotNullAndIsActiveTrue();
        List<User> notifyUsers = userRepository.findByRoleName(notifyRole);

        for (Category category : categories) {
            if (!categoryStockService.isBelowNotifyThreshold(category)) {
                continue;
            }
            String message = String.format(
                    "\"%s\" kategorisinde kalan miktar (%d) bildirim eşiğinin (%d) altına düştü.",
                    category.getName(),
                    categoryStockService.getStockCounts(category.getId()).getAvailableQuantity(),
                    category.getMinStockNotifyAt()
            );
            String mailSubject = "Envanter — Düşük Stok: " + category.getName();
            String mailBody = "<p>" + message + "</p>";
            try {
                mailService.sendEmail(notificationEmail, mailSubject, mailBody, true);
            } catch (Exception e) {
                log.warn("Düşük stok maili gönderilemedi ({}): {}", category.getCode(), e.getMessage());
            }
            for (User user : notifyUsers) {
                try {
                    notificationService.createSystemNotification(user, message);
                } catch (Exception e) {
                    log.warn("Bildirim oluşturulamadı ({}): {}", user.getEmail(), e.getMessage());
                }
            }
            log.info("Düşük stok bildirimi gönderildi: {}", category.getCode());
        }
        log.info("Kategori düşük stok kontrolü tamamlandı.");
    }
}
