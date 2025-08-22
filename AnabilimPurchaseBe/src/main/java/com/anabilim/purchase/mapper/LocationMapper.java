package com.anabilim.purchase.mapper;

import com.anabilim.purchase.dto.request.CreateLocationDto;
import com.anabilim.purchase.dto.response.LocationDto;
import com.anabilim.purchase.entity.Location;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
@Component
public class LocationMapper {

    public Location toEntity(CreateLocationDto locationDto) {
        Location location = new Location();
        location.setName(locationDto.getName());
        location.setDescription(locationDto.getDescription());
        return location;
    }

    public LocationDto toDto(Location location) {
        LocationDto locationDto = new LocationDto();
        locationDto.setName(location.getName());
        locationDto.setDescription(location.getDescription());
        locationDto.setId(location.getId().intValue());
        return locationDto;

    }

    public Location toEntity(Location location) {
        LocationDto locationDto = new LocationDto();
        locationDto.setName(location.getName());
        locationDto.setDescription(location.getDescription());
        return location;
    }
    public List<LocationDto> toDto(List<Location> locations) {
        List<LocationDto> locationDtos = new ArrayList<>();
        for (Location location : locations) {
            locationDtos.add(toDto(location));

        }
        return locationDtos;
    }

}
