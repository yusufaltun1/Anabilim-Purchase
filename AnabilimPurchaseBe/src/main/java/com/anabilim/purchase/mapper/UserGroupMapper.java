package com.anabilim.purchase.mapper;

import com.anabilim.purchase.dto.UserDto;
import com.anabilim.purchase.dto.UserGroupDto;
import com.anabilim.purchase.dto.UserGroupLinkDto;
import com.anabilim.purchase.entity.User;
import com.anabilim.purchase.entity.UserGroup;
import com.anabilim.purchase.entity.UserGroupLink;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserGroupMapper {

    public UserDto.UserBasicDto toUserBasicDto(User user) {
        if (user == null) return null;
        return new UserDto.UserBasicDto(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName()
        );
    }

    public UserGroupDto toDto(UserGroup entity) {
        if (entity == null) return null;
        UserGroupDto dto = new UserGroupDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setPositionX(entity.getPositionX());
        dto.setPositionY(entity.getPositionY());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        if (entity.getMembers() != null) {
            dto.setMembers(entity.getMembers().stream()
                .map(this::toUserBasicDto)
                .collect(Collectors.toList()));
        }
        return dto;
    }

    public UserGroupLinkDto toLinkDto(UserGroupLink link) {
        if (link == null) return null;
        UserGroupLinkDto dto = new UserGroupLinkDto();
        dto.setId(link.getId());
        dto.setSourceGroupId(link.getSourceGroup() != null ? link.getSourceGroup().getId() : null);
        dto.setTargetGroupId(link.getTargetGroup() != null ? link.getTargetGroup().getId() : null);
        dto.setLinkLabel(link.getLinkLabel());
        dto.setCreatedAt(link.getCreatedAt());
        return dto;
    }
}
