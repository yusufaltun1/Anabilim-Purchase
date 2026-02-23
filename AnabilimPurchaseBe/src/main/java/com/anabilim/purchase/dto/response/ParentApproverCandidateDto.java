package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Onaycının birden fazla üst gruba bağlı olması durumunda, seçilebilecek üst onaycı adayı (grup bazlı).
 * userId null ise grupta atanmış üye yoktur; seçilemez.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParentApproverCandidateDto {
    private Long userId;
    private String userName;
    private String groupName;
}
