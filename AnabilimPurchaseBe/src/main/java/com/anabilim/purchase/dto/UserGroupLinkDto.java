package com.anabilim.purchase.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserGroupLinkDto {
    private Long id;
    private Long sourceGroupId;
    private Long targetGroupId;
    private String linkLabel;
    private LocalDateTime createdAt;
}
