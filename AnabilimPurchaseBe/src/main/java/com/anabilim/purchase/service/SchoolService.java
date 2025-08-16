package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.request.CreateSchoolDto;
import com.anabilim.purchase.dto.response.SchoolDto;
import com.anabilim.purchase.entity.School;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SchoolService {
    
    SchoolDto createSchool(CreateSchoolDto createDto);
    
    SchoolDto updateSchool(Long id, CreateSchoolDto updateDto);
    
    void deleteSchool(Long id);
    
    SchoolDto getSchoolById(Long id);
    
    SchoolDto getSchoolByCode(String code);
    
    List<SchoolDto> getAllActiveSchools();
    
    Page<SchoolDto> getAllSchools(Pageable pageable);
    
    Page<SchoolDto> searchSchools(String search, Pageable pageable);
    
    List<SchoolDto> getSchoolsByCity(String city);
    
    List<SchoolDto> getSchoolsByDistrict(String district);
    
    List<SchoolDto> getSchoolsByType(String schoolType);
    
    // Entity dönüş metodları (internal kullanım için)
    School findSchoolEntityById(Long id);
    
    School findSchoolEntityByCode(String code);
    
    // İstatistik metodları
    long getActiveSchoolCount();
    
    List<Object[]> getSchoolCountByCity();
} 