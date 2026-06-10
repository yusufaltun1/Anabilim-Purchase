package com.anabilim.purchase.dto.response;

import com.anabilim.purchase.entity.Location;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationDto {

    private Long id;
    private String name;
    private String description;
    private Long parentId;
    private String parentName;
    private Integer level;
    private String path;

    public LocationDto(Location location) {
        this.id = location.getId();
        this.name = location.getName();
        this.description = location.getDescription();
        if (location.getParent() != null) {
            this.parentId = location.getParent().getId();
            this.parentName = location.getParent().getName();
        }
    }
}
