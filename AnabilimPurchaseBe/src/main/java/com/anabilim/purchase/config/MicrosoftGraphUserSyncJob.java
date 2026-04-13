package com.anabilim.purchase.config;

import com.anabilim.purchase.service.MicrosoftGraphUserListService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MicrosoftGraphUserSyncJob {

    private final MicrosoftGraphUserListService microsoftGraphUserListService;

    /**
     * Her gun gece 02:00 (Europe/Istanbul).
     */
    @Scheduled(cron = "0 0 2 * * *", zone = "Europe/Istanbul")
    public void runDailySync() {
        log.info("Microsoft Graph user sync job started.");
        microsoftGraphUserListService.fetchAndLogUsers();
        log.info("Microsoft Graph user sync job finished.");
    }
}
