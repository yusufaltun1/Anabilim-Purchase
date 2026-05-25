package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequestSummaryDto {
    private Long id;
    private String title;
    private String description;
}
