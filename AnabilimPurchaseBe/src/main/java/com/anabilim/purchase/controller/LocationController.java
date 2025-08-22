package com.anabilim.purchase.controller;


import com.anabilim.purchase.dto.request.CreateLocationDto;
import com.anabilim.purchase.dto.request.CreateProductDto;
import com.anabilim.purchase.dto.request.UpdateLocationDto;
import com.anabilim.purchase.dto.request.UpdateProductDto;
import com.anabilim.purchase.dto.response.LocationDto;
import com.anabilim.purchase.dto.response.ProductDto;
import com.anabilim.purchase.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {
    private final LocationService locationService;

    @GetMapping
    public ResponseEntity<List<LocationDto>> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }
    @PostMapping
    public ResponseEntity<LocationDto>  createLocation(@Valid @RequestBody CreateLocationDto createDto) {

        return new ResponseEntity<>(locationService.createLocation(createDto), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    @PutMapping("/{id}")
    public ResponseEntity<LocationDto> updateLocation(@PathVariable Long id,
                                                      @Valid @RequestBody UpdateLocationDto updateDto) {
        LocationDto updated = locationService.updateLocation(id, updateDto);
        return ResponseEntity.ok(updated);
    }


    @GetMapping("/{id}")
    public ResponseEntity<LocationDto> getLocation(@PathVariable Long id) {
        return ResponseEntity.ok(locationService.getLocationById(id));
    }


}
