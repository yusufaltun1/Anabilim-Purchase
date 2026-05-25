package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.DeviceModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeviceModelRepository extends JpaRepository<DeviceModel, Long> {
    List<DeviceModel> findByIsActiveTrueOrderByNameAsc();
}
