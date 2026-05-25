package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.request.CreateAssetConditionDto;
import com.anabilim.purchase.dto.request.CreateDeviceModelDto;
import com.anabilim.purchase.dto.request.CreateLocationDto;
import com.anabilim.purchase.dto.response.AssetConditionDto;
import com.anabilim.purchase.dto.response.DeviceModelDto;
import com.anabilim.purchase.dto.response.LocationDto;
import com.anabilim.purchase.entity.AssetCondition;
import com.anabilim.purchase.entity.DeviceModel;
import com.anabilim.purchase.entity.Location;
import com.anabilim.purchase.repository.AssetConditionRepository;
import com.anabilim.purchase.repository.CategoryRepository;
import com.anabilim.purchase.repository.DeviceModelRepository;
import com.anabilim.purchase.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryMasterController {

    private final DeviceModelRepository deviceModelRepository;
    private final AssetConditionRepository assetConditionRepository;
    private final LocationRepository locationRepository;
    private final CategoryRepository categoryRepository;
    @GetMapping("/device-models")
    public List<DeviceModelDto> listDeviceModels() {
        return deviceModelRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::toDeviceModelDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/device-models")
    public ResponseEntity<DeviceModelDto> createDeviceModel(@RequestBody CreateDeviceModelDto dto) {
        DeviceModel model = new DeviceModel();
        model.setName(dto.getName());
        model.setBrand(dto.getBrand());
        model.setEnableIp(Boolean.TRUE.equals(dto.getEnableIp()));
        model.setEnableMac(Boolean.TRUE.equals(dto.getEnableMac()));
        if (dto.getCategoryId() != null) {
            categoryRepository.findById(dto.getCategoryId()).ifPresent(model::setCategory);
        }
        model = deviceModelRepository.save(model);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDeviceModelDto(model));
    }

    @GetMapping("/asset-conditions")
    public List<AssetConditionDto> listAssetConditions() {
        return assetConditionRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::toConditionDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/asset-conditions")
    public ResponseEntity<AssetConditionDto> createAssetCondition(@RequestBody CreateAssetConditionDto dto) {
        AssetCondition condition = new AssetCondition();
        condition.setName(dto.getName());
        condition.setAllowsAssignment(dto.getAllowsAssignment() == null || dto.getAllowsAssignment());
        condition = assetConditionRepository.save(condition);
        return ResponseEntity.status(HttpStatus.CREATED).body(toConditionDto(condition));
    }

    @GetMapping("/locations/parents")
    public List<LocationDto> listParentLocations() {
        return locationRepository.findByParentIsNullOrderByNameAsc().stream()
                .map(this::toLocationDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/locations/children")
    public List<LocationDto> listChildLocations(@RequestParam Long parentId) {
        return locationRepository.findByParentIdOrderByNameAsc(parentId).stream()
                .map(this::toLocationDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/locations")
    public ResponseEntity<LocationDto> createLocation(@RequestBody CreateLocationWithParentDto dto) {
        Location location = new Location();
        location.setName(dto.getName());
        location.setDescription(dto.getDescription() != null ? dto.getDescription() : dto.getName());
        if (dto.getParentId() != null) {
            locationRepository.findById(dto.getParentId()).ifPresent(location::setParent);
        }
        location = locationRepository.save(location);
        return ResponseEntity.status(HttpStatus.CREATED).body(toLocationDto(location));
    }

    @lombok.Data
    public static class CreateLocationWithParentDto {
        private String name;
        private String description;
        private Long parentId;
    }

    private DeviceModelDto toDeviceModelDto(DeviceModel m) {
        DeviceModelDto dto = new DeviceModelDto();
        dto.setId(m.getId());
        dto.setName(m.getName());
        dto.setBrand(m.getBrand());
        dto.setEnableIp(m.getEnableIp());
        dto.setEnableMac(m.getEnableMac());
        if (m.getCategory() != null) {
            dto.setCategoryId(m.getCategory().getId());
        }
        return dto;
    }

    private AssetConditionDto toConditionDto(AssetCondition c) {
        AssetConditionDto dto = new AssetConditionDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setAllowsAssignment(c.getAllowsAssignment());
        return dto;
    }

    private LocationDto toLocationDto(Location l) {
        LocationDto dto = new LocationDto();
        dto.setId(l.getId());
        dto.setName(l.getName());
        dto.setDescription(l.getDescription());
        if (l.getParent() != null) {
            dto.setParentId(l.getParent().getId());
        }
        return dto;
    }
}
