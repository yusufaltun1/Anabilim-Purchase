package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentSignedFormDto {
    private boolean hasSignedForm;
    private String fileName;
    private String contentType;
    private LocalDateTime uploadedAt;
}
