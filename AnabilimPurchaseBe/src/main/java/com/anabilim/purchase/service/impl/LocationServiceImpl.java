package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.CreateLocationDto;
import com.anabilim.purchase.dto.request.UpdateLocationDto;
import com.anabilim.purchase.dto.response.LocationDto;
import com.anabilim.purchase.entity.Location;
import com.anabilim.purchase.mapper.LocationMapper;
import com.anabilim.purchase.repository.LocationRepository;
import com.anabilim.purchase.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LocationServiceImpl implements LocationService {

    private final LocationRepository locationRepository;
    private final LocationMapper locationMapper;

    @Override
    public LocationDto createLocation(CreateLocationDto createDto) {
        Location location = locationMapper.toEntity(createDto);
        location = locationRepository.save(location);
        return locationMapper.toDto(location);
    }

    // Diğer metotları da implement edebilirsin:
    @Override
    public LocationDto getLocationById(Long id) {
        return locationMapper.toDto(
                locationRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Konum bulunamadı: " + id))
        );
    }

    @Override
    public LocationDto getLocationByName(String name) {
        return locationMapper.toDto(locationRepository.findByName(name));
    }

    @Override
    public LocationDto getLocationByDescription(String description) {
        return locationMapper.toDto(locationRepository.findByDescription(description));
    }

    @Override
    public void deleteLocation(Long id) {
        if (!locationRepository.existsById(id)) {
            throw new RuntimeException("Silinmek istenen konum bulunamadı: " + id);
        }
        locationRepository.deleteById(id);
    }

    @Override
    public List<LocationDto> getAllLocations() {
        List<Location> locations = locationRepository.findAll();
        return locationMapper.toDto(locations);
    }

    @Override
    public LocationDto updateLocation(Long id, UpdateLocationDto updateDto) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Güncellenecek konum bulunamadı: " + id));

        location.setName(updateDto.getName());
        location.setDescription(updateDto.getDescription());

        Location updatedLocation = locationRepository.save(location);
        return locationMapper.toDto(updatedLocation);
    }



}
