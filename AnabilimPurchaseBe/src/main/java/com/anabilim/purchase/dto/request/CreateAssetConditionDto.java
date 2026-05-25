package com.anabilim.purchase.dto.request;

import lombok.Data;

@Data
public class CreateAssetConditionDto {
    private String name;
    private Boolean allowsAssignment;
}
