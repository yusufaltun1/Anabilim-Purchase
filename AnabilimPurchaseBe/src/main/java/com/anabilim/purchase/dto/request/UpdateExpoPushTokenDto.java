package com.anabilim.purchase.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateExpoPushTokenDto {
    @NotBlank(message = "Token boş olamaz")
    private String token;
}
