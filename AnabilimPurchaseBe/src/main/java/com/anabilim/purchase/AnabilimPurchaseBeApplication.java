package com.anabilim.purchase;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AnabilimPurchaseBeApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnabilimPurchaseBeApplication.class, args);
    }

}
