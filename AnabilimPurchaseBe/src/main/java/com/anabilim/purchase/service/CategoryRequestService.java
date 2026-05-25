package com.anabilim.purchase.service;

import com.anabilim.purchase.entity.Category;
import com.anabilim.purchase.entity.User;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.exception.ValidationException;
import com.anabilim.purchase.repository.CategoryRepository;
import com.anabilim.purchase.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryRequestService {

    private final CategoryRepository categoryRepository;
    private final MailService mailService;
    private final UserRepository userRepository;

    @Value("${inventory.low-stock.notification-email:bilgiislem@anabilim.k12.tr}")
    private String notificationEmail;

    @Transactional
    public void submitCategoryRequest(Long categoryId, String requesterEmail, String note) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + categoryId));
        if (!Boolean.TRUE.equals(category.getRequestable())) {
            throw new ValidationException("Bu kategori talep edilebilir değil.");
        }
        String requesterName = userRepository.findByEmailAndIsActiveTrue(requesterEmail)
                .map(User::getFullName)
                .orElse(requesterEmail);
        String subject = "Envanter Talep: " + category.getName();
        String body = "<p><strong>Kategori:</strong> " + category.getName() + "</p>"
                + "<p><strong>Talep eden:</strong> " + requesterName + " (" + requesterEmail + ")</p>"
                + (note != null && !note.isBlank() ? "<p><strong>Not:</strong> " + note + "</p>" : "");
        mailService.sendEmail(notificationEmail, subject, body, true);
    }
}
