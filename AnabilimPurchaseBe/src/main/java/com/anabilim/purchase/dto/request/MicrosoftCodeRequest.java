package com.anabilim.purchase.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MicrosoftCodeRequest {
    
    @NotBlank(message = "Microsoft access token is required")
    private String accessToken;
    
    @NotBlank(message = "Microsoft ID is required")
    private String microsoftId;
    
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotBlank(message = "Name is required")
    private String name;
}
