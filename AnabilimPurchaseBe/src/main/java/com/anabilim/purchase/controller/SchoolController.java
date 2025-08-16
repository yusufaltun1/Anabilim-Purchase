package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.request.CreateSchoolDto;
import com.anabilim.purchase.dto.response.SchoolDto;
import com.anabilim.purchase.service.SchoolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schools")
@RequiredArgsConstructor
public class SchoolController {

    private final SchoolService schoolService;

    @PostMapping
    public ResponseEntity<SchoolDto> createSchool(@Valid @RequestBody CreateSchoolDto createDto) {
        SchoolDto school = schoolService.createSchool(createDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(school);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SchoolDto> updateSchool(
            @PathVariable Long id,
            @Valid @RequestBody CreateSchoolDto updateDto) {
        SchoolDto school = schoolService.updateSchool(id, updateDto);
        return ResponseEntity.ok(school);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchool(@PathVariable Long id) {
        schoolService.deleteSchool(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SchoolDto> getSchoolById(@PathVariable Long id) {
        SchoolDto school = schoolService.getSchoolById(id);
        return ResponseEntity.ok(school);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<SchoolDto> getSchoolByCode(@PathVariable String code) {
        SchoolDto school = schoolService.getSchoolByCode(code);
        return ResponseEntity.ok(school);
    }

    @GetMapping
    public ResponseEntity<Page<SchoolDto>> getAllSchools(Pageable pageable) {
        Page<SchoolDto> schools = schoolService.getAllSchools(pageable);
        return ResponseEntity.ok(schools);
    }

    @GetMapping("/active")
    public ResponseEntity<List<SchoolDto>> getAllActiveSchools() {
        List<SchoolDto> schools = schoolService.getAllActiveSchools();
        return ResponseEntity.ok(schools);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<SchoolDto>> searchSchools(
            @RequestParam String query,
            Pageable pageable) {
        Page<SchoolDto> schools = schoolService.searchSchools(query, pageable);
        return ResponseEntity.ok(schools);
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<SchoolDto>> getSchoolsByCity(@PathVariable String city) {
        List<SchoolDto> schools = schoolService.getSchoolsByCity(city);
        return ResponseEntity.ok(schools);
    }

    @GetMapping("/district/{district}")
    public ResponseEntity<List<SchoolDto>> getSchoolsByDistrict(@PathVariable String district) {
        List<SchoolDto> schools = schoolService.getSchoolsByDistrict(district);
        return ResponseEntity.ok(schools);
    }

    @GetMapping("/type/{schoolType}")
    public ResponseEntity<List<SchoolDto>> getSchoolsByType(@PathVariable String schoolType) {
        List<SchoolDto> schools = schoolService.getSchoolsByType(schoolType);
        return ResponseEntity.ok(schools);
    }

    @GetMapping("/statistics/count")
    public ResponseEntity<Long> getActiveSchoolCount() {
        long count = schoolService.getActiveSchoolCount();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/statistics/by-city")
    public ResponseEntity<List<Object[]>> getSchoolCountByCity() {
        List<Object[]> statistics = schoolService.getSchoolCountByCity();
        return ResponseEntity.ok(statistics);
    }
} 