package com.anabilim.purchase.service;

import com.anabilim.purchase.entity.Notification;
import com.anabilim.purchase.entity.PurchaseRequest;
import com.anabilim.purchase.entity.User;
import com.microsoft.graph.models.BodyType;
import com.microsoft.graph.models.EmailAddress;
import com.microsoft.graph.models.ItemBody;
import com.microsoft.graph.models.Message;
import com.microsoft.graph.models.Recipient;
import com.microsoft.graph.serviceclient.GraphServiceClient;
import com.microsoft.graph.users.item.sendmail.SendMailPostRequestBody;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.LinkedList;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    @Autowired
    private GraphServiceClient graphServiceClient;

    @Value("${microsoft.graph.sender-email:altuny71@gmail.com}")
    private String senderEmail;

    @Value("${client.url:https://testsatinalma.anabilim.k12.tr}")
    private String clientUrl;

    /**
     * Genel amaçlı mail gönderimi.
     */
    public void sendEmail(String toEmail, String subject, String content, boolean html) {
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("Boş e-posta adresine mail gönderilmeye çalışıldı. Konu: {}", subject);
            return;
        }

        try {
            SendMailPostRequestBody sendMailPostRequestBody = new SendMailPostRequestBody();

            Message message = new Message();
            message.setSubject(subject);

            ItemBody body = new ItemBody();
            body.setContentType(html ? BodyType.Html : BodyType.Text);
            body.setContent(content);
            message.setBody(body);

            LinkedList<Recipient> toRecipients = new LinkedList<>();
            Recipient recipient = new Recipient();
            EmailAddress emailAddress = new EmailAddress();
            emailAddress.setAddress(toEmail);
            recipient.setEmailAddress(emailAddress);
            toRecipients.add(recipient);
            message.setToRecipients(toRecipients);

            sendMailPostRequestBody.setMessage(message);
            sendMailPostRequestBody.setSaveToSentItems(false);

            graphServiceClient.users().byUserId(senderEmail).sendMail().post(sendMailPostRequestBody);

            log.info("Email başarıyla gönderildi: {}", toEmail);
        } catch (Exception e) {
            log.error("E-posta gönderilemedi. Alıcı: {}", toEmail, e);
            throw new RuntimeException("E-posta gönderilemedi", e);
        }
    }

    /**
     * Sistem içinde oluşturulan bir bildirim için kullanıcıya e-posta gönderir.
     */
    public void sendNotificationEmail(User user, Notification notification) {
        if (user == null || user.getEmail() == null) {
            return;
        }

        String subject = buildNotificationSubject(notification);
        String htmlBody = buildNotificationHtmlBody(user, notification);

        sendEmail(user.getEmail(), subject, htmlBody, true);
    }

    private String buildNotificationSubject(Notification notification) {
        PurchaseRequest request = notification.getPurchaseRequest();
        if (request != null && request.getTitle() != null) {
            return "[Satın Alma] " + request.getTitle();
        }
        return "[Anabilim Satın Alma] Yeni Bildiriminiz Var";
    }

    private String buildNotificationHtmlBody(User user, Notification notification) {
        PurchaseRequest request = notification.getPurchaseRequest();
        String requestInfo = "";
        if (request != null) {
            StringBuilder sb = new StringBuilder();
            sb.append("<p style=\"margin:0 0 4px 0;\"><strong>Talep No:</strong> ")
              .append(request.getId())
              .append("</p>");
            if (request.getTitle() != null) {
                sb.append("<p style=\"margin:0 0 4px 0;\"><strong>Başlık:</strong> ")
                  .append(escapeHtml(request.getTitle()))
                  .append("</p>");
            }
            if (request.getStatus() != null) {
                sb.append("<p style=\"margin:0 0 4px 0;\"><strong>Durum:</strong> ")
                  .append(escapeHtml(request.getStatus().name()))
                  .append("</p>");
            }
            if (notification.getCreatedAt() != null) {
                sb.append("<p style=\"margin:0 0 4px 0;\"><strong>Bildirim Tarihi:</strong> ")
                  .append(notification.getCreatedAt().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")))
                  .append("</p>");
            }
            if (clientUrl != null && request.getId() != null) {
                String link = clientUrl.endsWith("/") ? clientUrl + "#/purchase-requests/" + request.getId()
                        : clientUrl + "/#/purchase-requests/" + request.getId();
                sb.append("<p style=\"margin:12px 0 0 0;\"><a href=\"")
                  .append(link)
                  .append("\" style=\"color:#ffffff;text-decoration:none;background:#2563eb;padding:8px 16px;border-radius:6px;display:inline-block;\">Talebi Görüntüle</a></p>");
            }
            requestInfo = sb.toString();
        }

        String message = notification.getMessage() != null ? escapeHtml(notification.getMessage()) : "";

        return """
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;background:#f3f4f6;padding:24px;">
                  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.08);padding:24px;">
                    <h2 style="margin:0 0 12px 0;font-size:18px;color:#111827;">Merhaba %s,</h2>
                    <p style="margin:0 0 16px 0;color:#111827;white-space:pre-line;">%s</p>
                    %s
                    <p style="margin:24px 0 0 0;font-size:12px;color:#6b7280;">
                      Bu e-posta Anabilim satın alma sistemi tarafından otomatik olarak gönderilmiştir. Lütfen bu mesaja yanıt vermeyiniz.
                    </p>
                  </div>
                </div>
                """.formatted(
                escapeHtml(user.getFullName() != null ? user.getFullName() : user.getEmail()),
                message,
                requestInfo
        );
    }

    private String escapeHtml(String input) {
        if (input == null) {
            return "";
        }
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
