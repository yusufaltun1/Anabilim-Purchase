package com.anabilim.purchase.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLocationDto {
    @NotBlank(message = "Konum adı boş olamaz")
    @Size(min = 2, max = 100, message = "Konum adı 2-100 karakter arasında olmalıdır")
    private String name;

    private String description;
}