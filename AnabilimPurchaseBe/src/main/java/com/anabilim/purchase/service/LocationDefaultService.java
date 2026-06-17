package com.anabilim.purchase.service;

import com.anabilim.purchase.entity.Location;
import com.anabilim.purchase.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationDefaultService {

    private final LocationRepository locationRepository;

    /**
     * isDefault null ise mevcut değere dokunulmaz (geriye dönük uyumluluk).
     */
    public void applyDefaultFlag(Location location, Boolean isDefault) {
        if (location == null || isDefault == null) {
            return;
        }
        if (!isDefault) {
            location.setDefaultLocation(false);
            return;
        }

        Long parentId = location.getParent() != null ? location.getParent().getId() : null;
        clearDefaultsAmongSiblings(parentId, location.getId());
        location.setDefaultLocation(true);
    }

    private void clearDefaultsAmongSiblings(Long parentId, Long excludeId) {
        List<Location> siblings = parentId == null
                ? locationRepository.findByParentIsNullOrderByDefaultLocationDescNameAsc()
                : locationRepository.findByParentIdOrderByDefaultLocationDescNameAsc(parentId);

        for (Location sibling : siblings) {
            if (excludeId != null && excludeId.equals(sibling.getId())) {
                continue;
            }
            if (sibling.isDefaultLocation()) {
                sibling.setDefaultLocation(false);
                locationRepository.save(sibling);
            }
        }
    }
}
