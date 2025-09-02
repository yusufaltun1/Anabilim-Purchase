package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.Product;
import com.anabilim.purchase.entity.Warehouse;
import com.anabilim.purchase.entity.WarehouseStock;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseStockRepository extends JpaRepository<WarehouseStock, Long> {
    
    @EntityGraph(attributePaths = {"warehouse", "product"})
    Optional<WarehouseStock> findByWarehouseAndProduct(Warehouse warehouse, Product product);
    
    @EntityGraph(attributePaths = {"warehouse", "product"})
    List<WarehouseStock> findByWarehouse(Warehouse warehouse);
    
    @EntityGraph(attributePaths = {"warehouse", "product"})
    List<WarehouseStock> findByProduct(Product product);

} 