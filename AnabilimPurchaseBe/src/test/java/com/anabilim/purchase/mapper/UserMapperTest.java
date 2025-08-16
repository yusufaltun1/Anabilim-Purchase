package com.anabilim.purchase.mapper;

import com.anabilim.purchase.dto.UserDto;
import com.anabilim.purchase.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserMapperTest {
    
    private UserMapper userMapper;
    
    @BeforeEach
    void setUp() {
        userMapper = new UserMapper();
    }
    
    @Test
    void toUserManagerDto_ShouldMapAllFields() {
        // Given
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setDepartment("IT");
        user.setPosition("Developer");
        
        User manager = new User();
        manager.setId(2L);
        manager.setEmail("manager@example.com");
        manager.setFirstName("Jane");
        manager.setLastName("Smith");
        user.setManager(manager);
        
        // When
        UserDto.UserManagerDto dto = userMapper.toUserManagerDto(user);
        
        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo(user.getId());
        assertThat(dto.getEmail()).isEqualTo(user.getEmail());
        assertThat(dto.getFirstName()).isEqualTo(user.getFirstName());
        assertThat(dto.getLastName()).isEqualTo(user.getLastName());
        assertThat(dto.getDepartment()).isEqualTo(user.getDepartment());
        assertThat(dto.getTitle()).isEqualTo(user.getPosition());
        
        assertThat(dto.getManager()).isNotNull();
        assertThat(dto.getManager().getId()).isEqualTo(manager.getId());
        assertThat(dto.getManager().getEmail()).isEqualTo(manager.getEmail());
        assertThat(dto.getManager().getFirstName()).isEqualTo(manager.getFirstName());
        assertThat(dto.getManager().getLastName()).isEqualTo(manager.getLastName());
    }
    
    @Test
    void toUserManagerDto_WithNullManager_ShouldMapOtherFields() {
        // Given
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setDepartment("IT");
        user.setPosition("Developer");
        
        // When
        UserDto.UserManagerDto dto = userMapper.toUserManagerDto(user);
        
        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo(user.getId());
        assertThat(dto.getEmail()).isEqualTo(user.getEmail());
        assertThat(dto.getFirstName()).isEqualTo(user.getFirstName());
        assertThat(dto.getLastName()).isEqualTo(user.getLastName());
        assertThat(dto.getDepartment()).isEqualTo(user.getDepartment());
        assertThat(dto.getTitle()).isEqualTo(user.getPosition());
        assertThat(dto.getManager()).isNull();
    }
    
    @Test
    void toUserManagerDto_WithNullUser_ShouldReturnNull() {
        // When
        UserDto.UserManagerDto dto = userMapper.toUserManagerDto(null);
        
        // Then
        assertThat(dto).isNull();
    }
} 