package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.AssetCondition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetConditionRepository extends JpaRepository<AssetCondition, Long> {
    List<AssetCondition> findByIsActiveTrueOrderByNameAsc();
}
