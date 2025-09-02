package com.anabilim.purchase.dto.response;

import com.anabilim.purchase.entity.enums.AssignmentStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentDto {
    
    private Long id;
    
    private Long stockItemId;
    
    private String serialNumber;
    
    private Long productId;
    
    private String productName;
    
    private String productCode;
    
    private Long assignedUserId;
    
    private String assignedUserName;
    
    private Long assignedLocationId;
    
    private String assignedLocationName;
    
    private String locationName;
    
    private String locationDetails;
    
    private LocalDateTime assignmentDate;
    
    private LocalDate expectedReturnDate;
    
    private LocalDateTime actualReturnDate;
    
    private AssignmentStatus status;
    
    private Integer quantity;
    
    private String notes;
    
    @JsonProperty("isActive")
    private boolean isActive;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // Hesaplanmış alanlar
    private boolean isExpired;
    
    private boolean isUserAssignment;
    
    private boolean isLocationAssignment;
    
    private boolean canBeReturned;
}
