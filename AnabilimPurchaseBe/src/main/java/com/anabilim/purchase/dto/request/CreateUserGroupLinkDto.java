package com.anabilim.purchase.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserGroupLinkDto {
    @NotNull(message = "Kaynak grup ID gerekli")
    private Long sourceGroupId;
    @NotNull(message = "Hedef grup ID gerekli")
    private Long targetGroupId;
    private String linkLabel;
}
