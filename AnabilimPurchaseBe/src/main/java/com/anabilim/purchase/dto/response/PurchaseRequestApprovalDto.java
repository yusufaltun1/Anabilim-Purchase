package com.anabilim.purchase.dto.response;

import com.anabilim.purchase.dto.UserDto;
import com.anabilim.purchase.entity.enums.ApprovalStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequestApprovalDto {
    private Long id;
    private UserDto.UserManagerDto approver;
    private String roleName;
    private Integer stepOrder;
    private ApprovalStatus status;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime actionTakenAt;
} 