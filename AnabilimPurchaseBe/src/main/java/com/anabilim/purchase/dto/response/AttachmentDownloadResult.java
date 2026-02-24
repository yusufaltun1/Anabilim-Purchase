package com.anabilim.purchase.dto.response;

import org.springframework.core.io.Resource;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentDownloadResult {
    private Resource resource;
    private String fileName;
    private String contentType;
}
