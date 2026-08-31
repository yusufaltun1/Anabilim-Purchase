package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BulkAssignmentOperationResultDto {
    private int successCount;
    private int failureCount;
    private List<String> errors = new ArrayList<>();
    private List<AssignmentDto> assignments = new ArrayList<>();
}
