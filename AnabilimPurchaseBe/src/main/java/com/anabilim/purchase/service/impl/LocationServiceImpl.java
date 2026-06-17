package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.CreateLocationDto;
import com.anabilim.purchase.dto.request.UpdateLocationDto;
import com.anabilim.purchase.dto.response.LocationDto;
import com.anabilim.purchase.entity.Location;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.exception.ValidationException;
import com.anabilim.purchase.mapper.LocationMapper;
import com.anabilim.purchase.repository.LocationRepository;
import com.anabilim.purchase.service.LocationDefaultService;
import com.anabilim.purchase.service.LocationService;
import com.anabilim.purchase.util.LocationSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LocationServiceImpl implements LocationService {

    private final LocationRepository locationRepository;
    private final LocationMapper locationMapper;
    private final LocationDefaultService locationDefaultService;

    @Override
    public LocationDto createLocation(CreateLocationDto createDto) {
        Location location = locationMapper.toEntity(createDto);
        applyParent(location, createDto.getParentId(), null);
        locationDefaultService.applyDefaultFlag(location, createDto.getIsDefault());
        location = locationRepository.save(location);
        return locationMapper.toDto(location);
    }

    @Override
    public LocationDto getLocationById(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Konum bulunamadı: " + id));
        return locationMapper.toDto(location);
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
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Silinmek istenen konum bulunamadı: " + id));
        if (locationRepository.existsByParentId(id)) {
            throw new ValidationException("Alt konumu olan bir kayıt silinemez. Önce alt konumları silin.");
        }
        locationRepository.delete(location);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationDto> getAllLocations() {
        List<Location> locations = locationRepository.findAllWithAncestors();
        return locationMapper.toDto(locations);
    }

    @Override
    public LocationDto updateLocation(Long id, UpdateLocationDto updateDto) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Güncellenecek konum bulunamadı: " + id));

        location.setName(updateDto.getName());
        location.setDescription(updateDto.getDescription());
        applyParent(location, updateDto.getParentId(), id);
        locationDefaultService.applyDefaultFlag(location, updateDto.getIsDefault());

        Location updatedLocation = locationRepository.save(location);
        return locationMapper.toDto(updatedLocation);
    }

    private void applyParent(Location location, Long parentId, Long selfId) {
        if (parentId == null) {
            location.setParent(null);
            return;
        }
        if (selfId != null && parentId.equals(selfId)) {
            throw new ValidationException("Konum kendi üst konumu olamaz.");
        }

        Location parent = locationRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Üst konum bulunamadı: " + parentId));

        if (selfId != null) {
            List<Location> all = locationRepository.findAllWithAncestors();
            Map<Long, Location> byId = all.stream()
                    .collect(Collectors.toMap(Location::getId, item -> item, (a, b) -> a));
            if (LocationSupport.isDescendant(parent, location, byId)) {
                throw new ValidationException("Konum kendi alt konumunun altına taşınamaz.");
            }
        }

        if (LocationSupport.depth(parent) >= LocationSupport.MAX_DEPTH) {
            throw new ValidationException("En fazla 3 seviye konum tanımlanabilir.");
        }

        location.setParent(parent);
    }
}
