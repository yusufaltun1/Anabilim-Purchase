package com.anabilim.purchase.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserGroupDto {
    private Long id;
    private String name;
    private String description;
    private Double positionX;
    private Double positionY;
    private List<UserDto.UserBasicDto> members = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
