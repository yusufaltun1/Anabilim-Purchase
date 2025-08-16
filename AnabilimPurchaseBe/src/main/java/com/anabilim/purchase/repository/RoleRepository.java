package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Role repository interface
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    Optional<Role> findByName(String name);
    
    Optional<Role> findByNameAndIsActiveTrue(String name);
    
    List<Role> findByIsActiveTrue();
    
    List<Role> findByIsSystemRoleTrue();
    
    boolean existsByName(String name);
} 