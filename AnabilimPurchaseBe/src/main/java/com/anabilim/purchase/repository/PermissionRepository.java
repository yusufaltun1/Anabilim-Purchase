package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Permission repository interface
 */
@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    
    Optional<Permission> findByName(String name);
    
    Optional<Permission> findByNameAndIsActiveTrue(String name);
    
    List<Permission> findByIsActiveTrue();
    
    List<Permission> findByResource(String resource);
    
    List<Permission> findByResourceAndIsActiveTrue(String resource);
    
    boolean existsByName(String name);
} 