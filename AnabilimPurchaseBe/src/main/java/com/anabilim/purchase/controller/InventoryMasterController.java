package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.request.CreateAssetConditionDto;
import com.anabilim.purchase.dto.request.CreateDeviceModelDto;
import com.anabilim.purchase.dto.request.UpdateDeviceModelDto;
import com.anabilim.purchase.dto.request.CreateLocationDto;
import com.anabilim.purchase.dto.response.AssetConditionDto;
import com.anabilim.purchase.dto.response.DeviceModelDto;
import com.anabilim.purchase.dto.response.LocationDto;
import com.anabilim.purchase.entity.AssetCondition;
import com.anabilim.purchase.entity.DeviceModel;
import com.anabilim.purchase.entity.Location;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.exception.ValidationException;
import com.anabilim.purchase.repository.AssetConditionRepository;
import com.anabilim.purchase.repository.CategoryRepository;
import com.anabilim.purchase.repository.DeviceModelRepository;
import com.anabilim.purchase.repository.LocationRepository;
import com.anabilim.purchase.service.LocationDefaultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.anabilim.purchase.util.LocationSupport;
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
    private final LocationDefaultService locationDefaultService;
    @GetMapping("/device-brands")
    public List<String> listDeviceBrands() {
        return deviceModelRepository.findDistinctActiveBrands().stream()
                .map(String::trim)
                .filter(b -> !b.isEmpty())
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
    }

    @GetMapping("/device-models")
    public List<DeviceModelDto> listDeviceModels() {
        return deviceModelRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::toDeviceModelDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/device-models")
    public ResponseEntity<DeviceModelDto> createDeviceModel(@RequestBody CreateDeviceModelDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (dto.getBrand() == null || dto.getBrand().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        DeviceModel model = new DeviceModel();
        model.setName(dto.getName().trim());
        model.setBrand(dto.getBrand().trim());
        model.setEnableIp(Boolean.TRUE.equals(dto.getEnableIp()));
        model.setEnableMac(Boolean.TRUE.equals(dto.getEnableMac()));
        if (dto.getCategoryId() != null) {
            categoryRepository.findById(dto.getCategoryId()).ifPresent(model::setCategory);
        }
        model = deviceModelRepository.save(model);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDeviceModelDto(model));
    }

    @PutMapping("/device-models/{id}")
    public ResponseEntity<DeviceModelDto> updateDeviceModel(
            @PathVariable Long id,
            @RequestBody UpdateDeviceModelDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (dto.getBrand() == null || dto.getBrand().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        DeviceModel model = deviceModelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cihaz modeli bulunamadı: " + id));
        model.setName(dto.getName().trim());
        model.setBrand(dto.getBrand().trim());
        if (dto.getEnableIp() != null) {
            model.setEnableIp(dto.getEnableIp());
        }
        if (dto.getEnableMac() != null) {
            model.setEnableMac(dto.getEnableMac());
        }
        model = deviceModelRepository.save(model);
        return ResponseEntity.ok(toDeviceModelDto(model));
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
        return locationRepository.findByParentIsNullOrderByDefaultLocationDescNameAsc().stream()
                .map(this::toLocationDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/locations/children")
    public List<LocationDto> listChildLocations(@RequestParam Long parentId) {
        return locationRepository.findByParentIdOrderByDefaultLocationDescNameAsc(parentId).stream()
                .map(this::toLocationDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/locations")
    public ResponseEntity<LocationDto> createLocation(@RequestBody CreateLocationWithParentDto dto) {
        Location location = new Location();
        location.setName(dto.getName());
        location.setDescription(dto.getDescription() != null ? dto.getDescription() : dto.getName());
        if (dto.getParentId() != null) {
            Location parent = locationRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Üst konum bulunamadı: " + dto.getParentId()));
            if (LocationSupport.depth(parent) >= LocationSupport.MAX_DEPTH) {
                throw new ValidationException("En fazla 3 seviye konum tanımlanabilir.");
            }
            location.setParent(parent);
        }
        locationDefaultService.applyDefaultFlag(location, dto.getIsDefault());
        location = locationRepository.save(location);
        return ResponseEntity.status(HttpStatus.CREATED).body(toLocationDto(location));
    }

    @lombok.Data
    public static class CreateLocationWithParentDto {
        private String name;
        private String description;
        private Long parentId;
        private Boolean isDefault;
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
            dto.setParentName(l.getParent().getName());
        }
        dto.setLevel(LocationSupport.depth(l));
        dto.setPath(LocationSupport.path(l));
        dto.setDefaultLocation(l.isDefaultLocation() ? Boolean.TRUE : null);
        return dto;
    }
}
