package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryBasicDto {
    private Long id;
    private String name;
    private String code;
}
