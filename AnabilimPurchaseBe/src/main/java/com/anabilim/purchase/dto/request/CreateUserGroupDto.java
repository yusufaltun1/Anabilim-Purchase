package com.anabilim.purchase.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserGroupDto {
    @NotBlank(message = "Grup adı boş olamaz")
    @Size(max = 255)
    private String name;
    private String description;
    private Double positionX = 0.0;
    private Double positionY = 0.0;
}
