package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentFormPhotoDto {
    private boolean uploaded;
    private String fileName;
    private String contentType;
    private String photoUrl;
}
