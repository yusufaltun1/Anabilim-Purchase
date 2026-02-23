package com.anabilim.purchase.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserGroupMembersDto {
    @NotNull(message = "Grup ID gerekli")
    private Long userGroupId;
    private List<Long> userIds = new ArrayList<>();
}
