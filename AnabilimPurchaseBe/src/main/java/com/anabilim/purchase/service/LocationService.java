package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.request.CreateLocationDto;
import com.anabilim.purchase.dto.request.UpdateLocationDto;
import com.anabilim.purchase.dto.response.LocationDto;

import java.util.List;

public interface LocationService {
    LocationDto getLocationById(Long id);
    LocationDto getLocationByName(String name);
    LocationDto getLocationByDescription(String description);
    LocationDto createLocation(CreateLocationDto createDto);
    void deleteLocation(Long id);
    List<LocationDto> getAllLocations();
    LocationDto updateLocation(Long id, UpdateLocationDto updateDto);


}
