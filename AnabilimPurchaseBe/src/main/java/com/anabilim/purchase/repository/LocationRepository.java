package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;


public interface LocationRepository extends JpaRepository<Location, Long> {
    Location findByName(String name);

    Location findByDescription(String description);


}
