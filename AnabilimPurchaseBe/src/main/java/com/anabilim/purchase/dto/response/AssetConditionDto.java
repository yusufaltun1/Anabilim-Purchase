package com.anabilim.purchase.dto.response;

import lombok.Data;

@Data
public class AssetConditionDto {
    private Long id;
    private String name;
    private Boolean allowsAssignment;
}
