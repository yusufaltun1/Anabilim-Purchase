package com.anabilim.purchase.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserGroupDto {
    @Size(max = 255)
    private String name;
    private String description;
    private Double positionX;
    private Double positionY;
}
