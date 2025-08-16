package com.anabilim.purchase.dto.response;

import com.anabilim.purchase.dto.UserDto;
import com.anabilim.purchase.entity.enums.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequestDto {
    private Long id;
    private String title;
    private String description;
    private UserDto.UserManagerDto requester;
    private RequestStatus status;
    private List<PurchaseRequestApprovalDto> approvals;
    private List<PurchaseRequestItemDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private String rejectionReason;
    
    // Yardımcı metodlar
    public boolean isPending() {
        return status == RequestStatus.PENDING;
    }
    
    public boolean isInApproval() {
        return status == RequestStatus.IN_APPROVAL;
    }
    
    public boolean isApproved() {
        return status == RequestStatus.APPROVED;
    }
    
    public boolean isRejected() {
        return status == RequestStatus.REJECTED;
    }
    
    public boolean isInProgress() {
        return status == RequestStatus.IN_PROGRESS;
    }
    
    public boolean isCompleted() {
        return status == RequestStatus.COMPLETED;
    }
    
    public boolean isCancelled() {
        return status == RequestStatus.CANCELLED;
    }
    
    public boolean isActive() {
        return !isCompleted() && !isCancelled() && !isRejected();
    }
} 