package com.anabilim.purchase.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateGroupPositionsDto {

    @Valid
    private List<GroupPositionItem> positions = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupPositionItem {
        @NotNull
        private Long id;
        @NotNull
        private Double positionX;
        @NotNull
        private Double positionY;
    }
}
