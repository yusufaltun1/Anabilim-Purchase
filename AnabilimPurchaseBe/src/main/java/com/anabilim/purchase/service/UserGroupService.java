package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.UserGroupDto;
import com.anabilim.purchase.dto.UserGroupLinkDto;
import com.anabilim.purchase.dto.request.CreateUserGroupDto;
import com.anabilim.purchase.dto.request.CreateUserGroupLinkDto;
import com.anabilim.purchase.dto.request.UpdateUserGroupDto;
import com.anabilim.purchase.dto.request.UpdateGroupPositionsDto;
import com.anabilim.purchase.dto.request.UserGroupMembersDto;

import com.anabilim.purchase.dto.response.ParentApproverCandidateDto;
import com.anabilim.purchase.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserGroupService {

    List<UserGroupDto> getAllGroups();

    UserGroupDto getGroupById(Long id);

    UserGroupDto createGroup(CreateUserGroupDto dto);

    UserGroupDto updateGroup(Long id, UpdateUserGroupDto dto);

    void deleteGroup(Long id);

    List<UserGroupLinkDto> getAllLinks();

    UserGroupLinkDto createLink(CreateUserGroupLinkDto dto);

    void deleteLink(Long linkId);

    UserGroupDto updateGroupPosition(Long id, Double positionX, Double positionY);

    void updateGroupPositions(List<UpdateGroupPositionsDto.GroupPositionItem> positions);

    UserGroupDto setGroupMembers(UserGroupMembersDto dto);

    /**
     * Ağaç yapısına göre kullanıcının bir üstündeki onaycıyı döner.
     * Kullanıcının üye olduğu grubun bağlı olduğu üst gruptaki (link'in source'u) bir kullanıcı seçilir.
     * Üst grupta aktif kullanıcı yoksa veya kullanıcı hiç grupta değilse empty döner.
     */
    Optional<User> findParentApproverForUser(User user);

    /**
     * Kullanıcının bağlı olduğu her üst grup için bir onaycı adayı döner.
     * Birden fazla üst grup varsa liste uzun olur; tek üst grup varsa liste tek elemanlı olur.
     * Seçim UI'da kullanılmak üzere (userId, userName, groupName).
     */
    List<ParentApproverCandidateDto> findParentApproverCandidatesForUser(User user);
}
