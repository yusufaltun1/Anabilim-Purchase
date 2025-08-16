package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.CreateSchoolDto;
import com.anabilim.purchase.dto.response.SchoolDto;
import com.anabilim.purchase.entity.School;
import com.anabilim.purchase.mapper.SchoolMapper;
import com.anabilim.purchase.repository.SchoolRepository;
import com.anabilim.purchase.service.SchoolService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SchoolServiceImpl implements SchoolService {

    private final SchoolRepository schoolRepository;
    private final SchoolMapper schoolMapper;

    @Override
    public SchoolDto createSchool(CreateSchoolDto createDto) {
        log.info("Creating new school with code: {}", createDto.getCode());
        
        // Kod benzersizliği kontrolü
        if (schoolRepository.existsByCode(createDto.getCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Bu okul kodu zaten kullanılıyor: " + createDto.getCode());
        }

        School school = schoolMapper.toEntity(createDto);
        school = schoolRepository.save(school);
        
        log.info("School created successfully with ID: {}", school.getId());
        return schoolMapper.toDto(school);
    }

    @Override
    public SchoolDto updateSchool(Long id, CreateSchoolDto updateDto) {
        log.info("Updating school with ID: {}", id);
        
        School school = findSchoolEntityById(id);
        
        // Kod değiştiriliyorsa benzersizlik kontrolü
        if (!school.getCode().equals(updateDto.getCode()) && 
            schoolRepository.existsByCode(updateDto.getCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Bu okul kodu zaten kullanılıyor: " + updateDto.getCode());
        }

        schoolMapper.updateEntity(school, updateDto);
        school = schoolRepository.save(school);
        
        log.info("School updated successfully with ID: {}", school.getId());
        return schoolMapper.toDto(school);
    }

    @Override
    public void deleteSchool(Long id) {
        log.info("Deleting school with ID: {}", id);
        
        School school = findSchoolEntityById(id);
        school.setActive(false);
        schoolRepository.save(school);
        
        log.info("School deactivated successfully with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public SchoolDto getSchoolById(Long id) {
        School school = findSchoolEntityById(id);
        return schoolMapper.toDto(school);
    }

    @Override
    @Transactional(readOnly = true)
    public SchoolDto getSchoolByCode(String code) {
        School school = findSchoolEntityByCode(code);
        return schoolMapper.toDto(school);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SchoolDto> getAllActiveSchools() {
        List<School> schools = schoolRepository.findByIsActiveTrue();
        return schoolMapper.toDtoList(schools);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SchoolDto> getAllSchools(Pageable pageable) {
        Page<School> schools = schoolRepository.findAll(pageable);
        return schools.map(schoolMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SchoolDto> searchSchools(String search, Pageable pageable) {
        Page<School> schools = schoolRepository.searchActiveSchools(search, pageable);
        return schools.map(schoolMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SchoolDto> getSchoolsByCity(String city) {
        List<School> schools = schoolRepository.findByCityAndIsActiveTrue(city);
        return schoolMapper.toDtoList(schools);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SchoolDto> getSchoolsByDistrict(String district) {
        List<School> schools = schoolRepository.findByDistrictAndIsActiveTrue(district);
        return schoolMapper.toDtoList(schools);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SchoolDto> getSchoolsByType(String schoolType) {
        List<School> schools = schoolRepository.findBySchoolTypeAndIsActiveTrue(schoolType);
        return schoolMapper.toDtoList(schools);
    }

    @Override
    @Transactional(readOnly = true)
    public School findSchoolEntityById(Long id) {
        return schoolRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Okul bulunamadı: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public School findSchoolEntityByCode(String code) {
        return schoolRepository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Okul bulunamadı: " + code));
    }

    @Override
    @Transactional(readOnly = true)
    public long getActiveSchoolCount() {
        return schoolRepository.countActiveSchools();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Object[]> getSchoolCountByCity() {
        return schoolRepository.countSchoolsByCity();
    }
} 