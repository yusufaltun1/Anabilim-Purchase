package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {
    Location findByName(String name);

    Location findByDescription(String description);

    List<Location> findByParentIsNullOrderByNameAsc();

    List<Location> findByParentIsNullOrderByIsDefaultDescNameAsc();

    List<Location> findByParentIdOrderByNameAsc(Long parentId);

    List<Location> findByParentIdOrderByIsDefaultDescNameAsc(Long parentId);

    boolean existsByParentId(Long parentId);

    @Query("SELECT DISTINCT l FROM Location l LEFT JOIN FETCH l.parent p LEFT JOIN FETCH p.parent ORDER BY l.name ASC")
    List<Location> findAllWithAncestors();
}
