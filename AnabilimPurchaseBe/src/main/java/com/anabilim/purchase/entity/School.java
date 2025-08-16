package com.anabilim.purchase.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Okul yönetimi için School entity'si
 */
@Entity
@Table(name = "schools")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class School {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "school_code", unique = true, nullable = false)
    private String code;
    
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "principal_name")
    private String principalName; // Müdür adı
    
    @Column(name = "district")
    private String district; // İlçe
    
    @Column(name = "city")
    private String city; // Şehir
    
    @Column(name = "school_type")
    private String schoolType; // İlkokul, Ortaokul, Lise vs.
    
    @Column(name = "student_capacity")
    private Integer studentCapacity;
    
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
    
    @OneToMany(mappedBy = "school", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<User> employees = new HashSet<>(); // Okul personelleri
    
    @OneToMany(mappedBy = "targetSchool", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<AssetTransfer> assetTransfers = new HashSet<>(); // Okula yapılan transferler
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Yardımcı metodlar
    public void addEmployee(User employee) {
        employees.add(employee);
        employee.setSchool(this);
    }
    
    public void removeEmployee(User employee) {
        employees.remove(employee);
        employee.setSchool(null);
    }
} 