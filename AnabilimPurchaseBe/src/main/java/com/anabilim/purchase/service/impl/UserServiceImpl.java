package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.UserDto;
import com.anabilim.purchase.entity.Role;
import com.anabilim.purchase.entity.User;

import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.repository.RoleRepository;
import com.anabilim.purchase.repository.UserRepository;
import com.anabilim.purchase.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDto> getActiveUsers() {
        return userRepository.findByIsActiveTrue().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + id));
        return convertToDto(user);
    }

    @Override
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + email));
        return convertToDto(user);
    }

    @Override
    public List<UserDto> getUsersByDepartment(String department) {
        return userRepository.findByDepartment(department).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDto> getUsersByRole(String roleName) {
        return userRepository.findByRoleName(roleName).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDto> getUsersByManager(Long managerId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Yönetici bulunamadı: " + managerId));
        return userRepository.findByManager(manager).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto createUser(UserDto userDto) {
        // Email kontrolü
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new IllegalArgumentException("Bu email adresi zaten kullanımda: " + userDto.getEmail());
        }

        User user = convertToEntity(userDto);
        user.setDisplayName(generateDisplayName(userDto.getFirstName(), userDto.getLastName()));
        
        // Rolleri ekle
        if (userDto.getRoles() != null && !userDto.getRoles().isEmpty()) {
            user.setRoles(new HashSet<>());
            userDto.getRoles().forEach(roleName -> {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Rol bulunamadı: " + roleName));
                user.getRoles().add(role);
            });
        }

        User savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }

    @Override
    public UserDto updateUser(UserDto userDto) {
        User existingUser = userRepository.findById(userDto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + userDto.getId()));

        // Email değişmişse kontrol et
        if (!existingUser.getEmail().equals(userDto.getEmail()) &&
                userRepository.existsByEmail(userDto.getEmail())) {
            throw new IllegalArgumentException("Bu email adresi zaten kullanımda: " + userDto.getEmail());
        }

        // Temel bilgileri güncelle
        existingUser.setEmail(userDto.getEmail());
        existingUser.setFirstName(userDto.getFirstName());
        existingUser.setLastName(userDto.getLastName());
        existingUser.setDisplayName(generateDisplayName(userDto.getFirstName(), userDto.getLastName()));
        existingUser.setDepartment(userDto.getDepartment());
        existingUser.setPosition(userDto.getPosition());
        existingUser.setPhone(userDto.getPhone());
        existingUser.setIsActive(userDto.getIsActive());
        existingUser.setMicrosoft365Id(userDto.getMicrosoft365Id());

        // Manager'ı güncelle
        if (userDto.getManager() != null && userDto.getManager().getId() != null) {
            User manager = userRepository.findById(userDto.getManager().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Yönetici bulunamadı: " + userDto.getManager().getId()));
            existingUser.setManager(manager);
        } else {
            existingUser.setManager(null); // Manager silinmişse null yap
        }

        // Rolleri güncelle
        if (userDto.getRoles() != null) {
            existingUser.getRoles().clear();
            userDto.getRoles().forEach(roleName -> {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Rol bulunamadı: " + roleName));
                existingUser.getRoles().add(role);
            });
        }

        User updatedUser = userRepository.save(existingUser);
        return convertToDto(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + id));
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Override
    public UserDto addRoleToUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + userId));
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Rol bulunamadı: " + roleName));

        user.getRoles().add(role);
        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    @Override
    public UserDto removeRoleFromUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + userId));
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Rol bulunamadı: " + roleName));

        user.getRoles().remove(role);
        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    private UserDto convertToDto(User user) {
        if (user == null) {
            return null;
        }
        
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setDisplayName(user.getDisplayName());
        dto.setDepartment(user.getDepartment());
        dto.setPosition(user.getPosition());
        dto.setPhone(user.getPhone());
        dto.setIsActive(user.getIsActive());
        dto.setMicrosoft365Id(user.getMicrosoft365Id());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setLastLoginAt(user.getLastLoginAt());
        
        // Manager bilgisini dönüştür
        if (user.getManager() != null) {
            dto.setManager(convertToManagerDto(user.getManager()));
        }
        
        // Alt çalışanları dönüştür
        if (user.getSubordinates() != null) {
            Set<UserDto.UserManagerDto> subordinateDtos = new HashSet<>();
            for (User subordinate : user.getSubordinates()) {
                subordinateDtos.add(convertToManagerDto(subordinate));
            }
            dto.setSubordinates(subordinateDtos);
        }
        
        // Rolleri dönüştür
        if (user.getRoles() != null) {
            Set<String> roleNames = new HashSet<>();
            for (Role role : user.getRoles()) {
                roleNames.add(role.getName());
            }
            dto.setRoles(roleNames);
        }
        
        return dto;
    }

    private UserDto.UserManagerDto convertToManagerDto(User user) {
        if (user == null) {
            return null;
        }
        return new UserDto.UserManagerDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getDisplayName(),
                user.getPosition()
        );
    }

    private User convertToEntity(UserDto dto) {
        User user = new User();
        user.setId(dto.getId());
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setDisplayName(dto.getDisplayName());
        user.setDepartment(dto.getDepartment());
        user.setPosition(dto.getPosition());
        user.setPhone(dto.getPhone());
        user.setIsActive(dto.getIsActive());
        user.setMicrosoft365Id(dto.getMicrosoft365Id());
        
        // Manager'ı ayarla
        if (dto.getManager() != null && dto.getManager().getId() != null) {
            User manager = userRepository.findById(dto.getManager().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Yönetici bulunamadı: " + dto.getManager().getId()));
            user.setManager(manager);
        }
        
        return user;
    }

    private String generateDisplayName(String firstName, String lastName) {
        return firstName + " " + lastName;
    }
} 