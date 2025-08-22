package com.anabilim.purchase.dto.response;

import com.anabilim.purchase.entity.Location;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationDto {

    private String name;
    private String description;
    private int id;


    public LocationDto(Location location) {
        this.name = location.getName();
        this.description = location.getDescription();

    }

}