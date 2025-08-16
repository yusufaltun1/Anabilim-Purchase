package com.anabilim.purchase.mapper;

import com.anabilim.purchase.dto.UserDto;
import com.anabilim.purchase.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    
    public UserDto.UserManagerDto toUserManagerDto(User user) {
        if (user == null) {
            return null;
        }
        
        UserDto.UserManagerDto dto = new UserDto.UserManagerDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setDepartment(user.getDepartment());
        dto.setTitle(user.getPosition());
        
        if (user.getManager() != null) {
            UserDto.UserBasicDto managerDto = new UserDto.UserBasicDto();
            managerDto.setId(user.getManager().getId());
            managerDto.setEmail(user.getManager().getEmail());
            managerDto.setFirstName(user.getManager().getFirstName());
            managerDto.setLastName(user.getManager().getLastName());
            dto.setManager(managerDto);
        }
        
        return dto;
    }
} 