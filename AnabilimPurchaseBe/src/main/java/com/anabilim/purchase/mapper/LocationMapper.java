package com.anabilim.purchase.mapper;

import com.anabilim.purchase.dto.request.CreateLocationDto;
import com.anabilim.purchase.dto.response.LocationDto;
import com.anabilim.purchase.entity.Location;
import com.anabilim.purchase.util.LocationSupport;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        locationDto.setId(location.getId());
        if (location.getParent() != null) {
            locationDto.setParentId(location.getParent().getId());
            locationDto.setParentName(location.getParent().getName());
        }
        locationDto.setLevel(LocationSupport.depth(location));
        locationDto.setPath(LocationSupport.path(location));
        return locationDto;
    }

    public LocationDto toDto(Location location, Map<Long, Location> byId) {
        LocationDto dto = toDto(location);
        dto.setLevel(LocationSupport.depthFromMap(location, byId));
        dto.setPath(LocationSupport.pathFromMap(location, byId));
        return dto;
    }

    public List<LocationDto> toDto(List<Location> locations) {
        Map<Long, Location> byId = locations.stream()
                .collect(Collectors.toMap(Location::getId, location -> location, (a, b) -> a));
        List<LocationDto> locationDtos = new ArrayList<>();
        for (Location location : locations) {
            locationDtos.add(toDto(location, byId));
        }
        locationDtos.sort(Comparator
                .comparing(LocationDto::getPath, Comparator.nullsLast(String::compareToIgnoreCase))
                .thenComparing(LocationDto::getName, String::compareToIgnoreCase));
        return locationDtos;
    }
}
