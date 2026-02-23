package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Onaycının üstü yokken talebi iletebileceği alt kırılımdaki kişi (talep sahibi veya önceki onaycı). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendDownCandidateDto {
    private Long userId;
    private String userName;
    private String label;
}
