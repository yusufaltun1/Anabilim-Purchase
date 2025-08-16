package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.UserDto;

import java.util.List;

public interface UserService {
    List<UserDto> getAllUsers();
    List<UserDto> getActiveUsers();
    UserDto getUserById(Long id);
    UserDto getUserByEmail(String email);
    List<UserDto> getUsersByDepartment(String department);
    List<UserDto> getUsersByRole(String roleName);
    List<UserDto> getUsersByManager(Long managerId);
    UserDto createUser(UserDto userDto);
    UserDto updateUser(UserDto userDto);
    void deleteUser(Long id);
    UserDto addRoleToUser(Long userId, String roleName);
    UserDto removeRoleFromUser(Long userId, String roleName);
} 