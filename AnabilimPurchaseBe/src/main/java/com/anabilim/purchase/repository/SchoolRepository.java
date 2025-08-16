package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.School;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {
    
    List<School> findByIsActiveTrue();
    
    Optional<School> findByCode(String code);
    
    boolean existsByCode(String code);
    
    List<School> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
    
    List<School> findByCityAndIsActiveTrue(String city);
    
    List<School> findByDistrictAndIsActiveTrue(String district);
    
    List<School> findBySchoolTypeAndIsActiveTrue(String schoolType);
    
    // Pageable versiyonlar
    Page<School> findByIsActiveTrue(Pageable pageable);
    
    Page<School> findByNameContainingIgnoreCaseAndIsActiveTrue(String name, Pageable pageable);
    
    Page<School> findByCityAndIsActiveTrue(String city, Pageable pageable);
    
    Page<School> findByDistrictAndIsActiveTrue(String district, Pageable pageable);
    
    // Arama sorguları
    @Query("SELECT s FROM School s WHERE s.isActive = true AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.city) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.district) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<School> searchActiveSchools(@Param("search") String search);
    
    @Query("SELECT s FROM School s WHERE s.isActive = true AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.city) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.district) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<School> searchActiveSchools(@Param("search") String search, Pageable pageable);
    
    // İstatistik sorguları
    @Query("SELECT COUNT(s) FROM School s WHERE s.isActive = true")
    long countActiveSchools();
    
    @Query("SELECT s.city, COUNT(s) FROM School s WHERE s.isActive = true GROUP BY s.city")
    List<Object[]> countSchoolsByCity();
} 