package com.anabilim.purchase.config;

import com.anabilim.purchase.service.MicrosoftGraphUserListService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
//@Component
//@RequiredArgsConstructor
//@Slf4j
public class StartupRunner  {
//    private final MicrosoftGraphUserListService microsoftGraphUserListService;
//    @Value("${microsoft.graph.fetch-users-on-startup:true}")
//    private boolean fetchUsersOnStartup;
//    @Override
//    public void run(String... args) {
//        if (!fetchUsersOnStartup) {
//            log.info("Microsoft Graph startup user fetch is disabled.");
//            return;
//        }
//        log.info("Microsoft Graph startup user fetch started.");
//        microsoftGraphUserListService.fetchAndLogUsers();
//    }
}