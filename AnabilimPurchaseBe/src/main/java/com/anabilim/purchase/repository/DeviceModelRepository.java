package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.DeviceModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DeviceModelRepository extends JpaRepository<DeviceModel, Long> {
    List<DeviceModel> findByIsActiveTrueOrderByNameAsc();

    @Query("SELECT DISTINCT m.brand FROM DeviceModel m WHERE m.isActive = true AND m.brand IS NOT NULL ORDER BY m.brand ASC")
    List<String> findDistinctActiveBrands();
}
