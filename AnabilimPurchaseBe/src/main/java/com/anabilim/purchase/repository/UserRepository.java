package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.School;
import com.anabilim.purchase.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * User repository interface
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    @EntityGraph(attributePaths = {"roles", "roles.permissions", "manager", "subordinates"})
    @Override
    List<User> findAll();
    
    @EntityGraph(attributePaths = {"roles", "roles.permissions", "manager", "subordinates"})
    Optional<User> findByEmail(String email);
    
    @EntityGraph(attributePaths = {"roles", "roles.permissions", "manager", "subordinates"})
    Optional<User> findByMicrosoft365Id(String microsoft365Id);
    
    @EntityGraph(attributePaths = {"roles", "roles.permissions", "manager", "subordinates"})
    Optional<User> findByEmailAndIsActiveTrue(String email);
    
    @EntityGraph(attributePaths = {"roles", "roles.permissions", "manager", "subordinates"})
    List<User> findByManager(User manager);
    
    @EntityGraph(attributePaths = {"roles", "roles.permissions", "manager", "subordinates"})
    List<User> findByIsActiveTrue();
    
    @EntityGraph(attributePaths = {"roles", "roles.permissions", "manager", "subordinates"})
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName AND u.isActive = true")
    List<User> findByRoleName(@Param("roleName") String roleName);
    
    @EntityGraph(attributePaths = {"roles", "roles.permissions", "manager", "subordinates"})
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name IN :roleNames AND u.isActive = true")
    List<User> findByRoleNames(@Param("roleNames") List<String> roleNames);
    
    @EntityGraph(attributePaths = {"roles", "roles.permissions", "manager", "subordinates"})
    List<User> findByDepartment(String department);
    
    @EntityGraph(attributePaths = {"roles", "roles.permissions", "manager", "subordinates"})
    @Query("SELECT u FROM User u WHERE u.manager IS NULL AND u.isActive = true")
    List<User> findTopLevelManagers();
    
    // School related methods
    @EntityGraph(attributePaths = {"roles", "roles.permissions", "manager", "subordinates", "school"})
    List<User> findBySchool(School school);
    
    @EntityGraph(attributePaths = {"roles", "roles.permissions", "manager", "subordinates", "school"})
    List<User> findBySchoolAndIsActiveTrue(School school);
    
    @EntityGraph(attributePaths = {"roles", "roles.permissions", "manager", "subordinates", "school"})
    @Query("SELECT u FROM User u WHERE u.school IS NOT NULL AND u.isActive = true")
    List<User> findSchoolEmployees();
    
    @EntityGraph(attributePaths = {"roles", "roles.permissions", "manager", "subordinates", "school"})
    @Query("SELECT u FROM User u WHERE u.school IS NULL AND u.isActive = true")
    List<User> findNonSchoolEmployees();
    
    boolean existsByEmail(String email);
    
    boolean existsByMicrosoft365Id(String microsoft365Id);
    
    @EntityGraph(attributePaths = {"roles", "roles.permissions", "manager", "subordinates"})
    @Override
    Optional<User> findById(Long id);
} 