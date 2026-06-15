package com.anabilim.purchase.util;

import com.anabilim.purchase.entity.Location;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public final class LocationSupport {

    public static final int MAX_DEPTH = 3;

    private LocationSupport() {
    }

    public static int depth(Location location) {
        if (location == null) {
            return 0;
        }
        int level = 1;
        Location current = location.getParent();
        while (current != null) {
            level++;
            current = current.getParent();
        }
        return level;
    }

    public static int depthFromMap(Location location, Map<Long, Location> byId) {
        if (location == null) {
            return 0;
        }
        int level = 1;
        Long parentId = location.getParent() != null ? location.getParent().getId() : null;
        while (parentId != null) {
            level++;
            Location parent = byId.get(parentId);
            parentId = parent != null && parent.getParent() != null ? parent.getParent().getId() : null;
        }
        return level;
    }

    public static String path(Location location) {
        if (location == null) {
            return "";
        }
        List<String> parts = new ArrayList<>();
        Location current = location;
        while (current != null) {
            parts.add(current.getName());
            current = current.getParent();
        }
        Collections.reverse(parts);
        return String.join(" › ", parts);
    }

    public static String pathFromMap(Location location, Map<Long, Location> byId) {
        if (location == null) {
            return "";
        }
        List<String> parts = new ArrayList<>();
        Location current = location;
        while (current != null) {
            parts.add(current.getName());
            Long parentId = current.getParent() != null ? current.getParent().getId() : null;
            current = parentId != null ? byId.get(parentId) : null;
        }
        Collections.reverse(parts);
        return String.join(" › ", parts);
    }

    public static boolean isDescendant(Location candidate, Location ancestor, Map<Long, Location> byId) {
        if (candidate == null || ancestor == null) {
            return false;
        }
        Long parentId = candidate.getParent() != null ? candidate.getParent().getId() : null;
        while (parentId != null) {
            if (parentId.equals(ancestor.getId())) {
                return true;
            }
            Location parent = byId.get(parentId);
            parentId = parent != null && parent.getParent() != null ? parent.getParent().getId() : null;
        }
        return false;
    }
}
