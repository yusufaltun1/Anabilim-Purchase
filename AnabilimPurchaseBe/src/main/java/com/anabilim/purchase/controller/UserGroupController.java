package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.ApiResponse;
import com.anabilim.purchase.dto.UserGroupDto;
import com.anabilim.purchase.dto.UserGroupLinkDto;
import com.anabilim.purchase.dto.request.CreateUserGroupDto;
import com.anabilim.purchase.dto.request.CreateUserGroupLinkDto;
import com.anabilim.purchase.dto.request.UpdateGroupPositionsDto;
import com.anabilim.purchase.dto.request.UpdateUserGroupDto;
import com.anabilim.purchase.dto.request.UserGroupMembersDto;
import com.anabilim.purchase.service.UserGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user-groups")
@RequiredArgsConstructor
@Slf4j
public class UserGroupController {

    private final UserGroupService userGroupService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserGroupDto>>> getAllGroups() {
        List<UserGroupDto> groups = userGroupService.getAllGroups();
        return ResponseEntity.ok(ApiResponse.success("Gruplar getirildi", groups));
    }

    @GetMapping("/whiteboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWhiteboardData() {
        List<UserGroupDto> groups = userGroupService.getAllGroups();
        List<UserGroupLinkDto> links = userGroupService.getAllLinks();
        Map<String, Object> data = new HashMap<>();
        data.put("groups", groups);
        data.put("links", links);
        return ResponseEntity.ok(ApiResponse.success("Whiteboard verisi getirildi", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserGroupDto>> getGroupById(@PathVariable Long id) {
        UserGroupDto group = userGroupService.getGroupById(id);
        return ResponseEntity.ok(ApiResponse.success("Grup getirildi", group));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserGroupDto>> createGroup(@Valid @RequestBody CreateUserGroupDto dto) {
        UserGroupDto created = userGroupService.createGroup(dto);
        return ResponseEntity.ok(ApiResponse.success("Grup oluşturuldu", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserGroupDto>> updateGroup(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserGroupDto dto) {
        UserGroupDto updated = userGroupService.updateGroup(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Grup güncellendi", updated));
    }

    @PatchMapping("/{id}/position")
    public ResponseEntity<ApiResponse<UserGroupDto>> updateGroupPosition(
            @PathVariable Long id,
            @RequestParam Double positionX,
            @RequestParam Double positionY) {
        UserGroupDto updated = userGroupService.updateGroupPosition(id, positionX, positionY);
        return ResponseEntity.ok(ApiResponse.success("Pozisyon güncellendi", updated));
    }

    @PutMapping("/positions")
    public ResponseEntity<ApiResponse<Void>> updateGroupPositions(
            @Valid @RequestBody UpdateGroupPositionsDto dto) {
        userGroupService.updateGroupPositions(dto.getPositions());
        return ResponseEntity.ok(ApiResponse.success("Tüm pozisyonlar kaydedildi", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGroup(@PathVariable Long id) {
        userGroupService.deleteGroup(id);
        return ResponseEntity.ok(ApiResponse.success("Grup silindi", null));
    }

    @GetMapping("/links")
    public ResponseEntity<ApiResponse<List<UserGroupLinkDto>>> getAllLinks() {
        List<UserGroupLinkDto> links = userGroupService.getAllLinks();
        return ResponseEntity.ok(ApiResponse.success("Bağlantılar getirildi", links));
    }

    @PostMapping("/links")
    public ResponseEntity<ApiResponse<UserGroupLinkDto>> createLink(@Valid @RequestBody CreateUserGroupLinkDto dto) {
        UserGroupLinkDto created = userGroupService.createLink(dto);
        return ResponseEntity.ok(ApiResponse.success("Bağlantı oluşturuldu", created));
    }

    @DeleteMapping("/links/{linkId}")
    public ResponseEntity<ApiResponse<Void>> deleteLink(@PathVariable Long linkId) {
        userGroupService.deleteLink(linkId);
        return ResponseEntity.ok(ApiResponse.success("Bağlantı silindi", null));
    }

    @PutMapping("/members")
    public ResponseEntity<ApiResponse<UserGroupDto>> setGroupMembers(@Valid @RequestBody UserGroupMembersDto dto) {
        UserGroupDto updated = userGroupService.setGroupMembers(dto);
        return ResponseEntity.ok(ApiResponse.success("Grup üyeleri güncellendi", updated));
    }
}
