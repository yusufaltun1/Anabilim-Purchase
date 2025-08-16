package com.anabilim.purchase.mapper;

import com.anabilim.purchase.dto.request.CreateSchoolDto;
import com.anabilim.purchase.dto.response.SchoolDto;
import com.anabilim.purchase.entity.School;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SchoolMapper {
    
    public School toEntity(CreateSchoolDto createDto) {
        School school = new School();
        school.setName(createDto.getName());
        school.setCode(createDto.getCode());
        school.setAddress(createDto.getAddress());
        school.setPhone(createDto.getPhone());
        school.setEmail(createDto.getEmail());
        school.setPrincipalName(createDto.getPrincipalName());
        school.setDistrict(createDto.getDistrict());
        school.setCity(createDto.getCity());
        school.setSchoolType(createDto.getSchoolType());
        school.setStudentCapacity(createDto.getStudentCapacity());
        return school;
    }
    
    public void updateEntity(School school, CreateSchoolDto updateDto) {
        school.setName(updateDto.getName());
        school.setCode(updateDto.getCode());
        school.setAddress(updateDto.getAddress());
        school.setPhone(updateDto.getPhone());
        school.setEmail(updateDto.getEmail());
        school.setPrincipalName(updateDto.getPrincipalName());
        school.setDistrict(updateDto.getDistrict());
        school.setCity(updateDto.getCity());
        school.setSchoolType(updateDto.getSchoolType());
        school.setStudentCapacity(updateDto.getStudentCapacity());
    }
    
    public SchoolDto toDto(School school) {
        if (school == null) {
            return null;
        }
        
        SchoolDto dto = new SchoolDto();
        dto.setId(school.getId());
        dto.setName(school.getName());
        dto.setCode(school.getCode());
        dto.setAddress(school.getAddress());
        dto.setPhone(school.getPhone());
        dto.setEmail(school.getEmail());
        dto.setPrincipalName(school.getPrincipalName());
        dto.setDistrict(school.getDistrict());
        dto.setCity(school.getCity());
        dto.setSchoolType(school.getSchoolType());
        dto.setStudentCapacity(school.getStudentCapacity());
        dto.setActive(school.isActive());
        dto.setCreatedAt(school.getCreatedAt());
        dto.setUpdatedAt(school.getUpdatedAt());
        
        // İstatistik bilgileri
        if (school.getEmployees() != null) {
            dto.setEmployeeCount(school.getEmployees().size());
        } else {
            dto.setEmployeeCount(0);
        }
        
        if (school.getAssetTransfers() != null) {
            dto.setTransferCount(school.getAssetTransfers().size());
        } else {
            dto.setTransferCount(0);
        }
        
        return dto;
    }
    
    public List<SchoolDto> toDtoList(List<School> schools) {
        return schools.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
} 