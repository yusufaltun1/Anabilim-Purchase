package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.UserGroupDto;
import com.anabilim.purchase.dto.UserGroupLinkDto;
import com.anabilim.purchase.dto.response.ParentApproverCandidateDto;
import com.anabilim.purchase.dto.request.CreateUserGroupDto;
import com.anabilim.purchase.dto.request.CreateUserGroupLinkDto;
import com.anabilim.purchase.dto.request.UpdateGroupPositionsDto;
import com.anabilim.purchase.dto.request.UpdateUserGroupDto;
import com.anabilim.purchase.dto.request.UserGroupMembersDto;
import com.anabilim.purchase.entity.User;
import com.anabilim.purchase.entity.UserGroup;
import com.anabilim.purchase.entity.UserGroupLink;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.mapper.UserGroupMapper;
import com.anabilim.purchase.repository.UserGroupLinkRepository;
import com.anabilim.purchase.repository.UserGroupRepository;
import com.anabilim.purchase.repository.UserRepository;
import com.anabilim.purchase.service.UserGroupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserGroupServiceImpl implements UserGroupService {

    private final UserGroupRepository userGroupRepository;
    private final UserGroupLinkRepository userGroupLinkRepository;
    private final UserRepository userRepository;
    private final UserGroupMapper userGroupMapper;

    @Override
    @Transactional(readOnly = true)
    public List<UserGroupDto> getAllGroups() {
        return userGroupRepository.findAll().stream()
            .map(userGroupMapper::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserGroupDto getGroupById(Long id) {
        UserGroup group = userGroupRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Grup bulunamadı: " + id));
        return userGroupMapper.toDto(group);
    }

    @Override
    public UserGroupDto createGroup(CreateUserGroupDto dto) {
        UserGroup group = new UserGroup();
        group.setName(dto.getName());
        group.setDescription(dto.getDescription());
        group.setPositionX(dto.getPositionX() != null ? dto.getPositionX() : 0.0);
        group.setPositionY(dto.getPositionY() != null ? dto.getPositionY() : 0.0);
        group = userGroupRepository.save(group);
        return userGroupMapper.toDto(group);
    }

    @Override
    public UserGroupDto updateGroup(Long id, UpdateUserGroupDto dto) {
        UserGroup group = userGroupRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Grup bulunamadı: " + id));
        if (dto.getName() != null) group.setName(dto.getName());
        if (dto.getDescription() != null) group.setDescription(dto.getDescription());
        if (dto.getPositionX() != null) group.setPositionX(dto.getPositionX());
        if (dto.getPositionY() != null) group.setPositionY(dto.getPositionY());
        group = userGroupRepository.save(group);
        return userGroupMapper.toDto(group);
    }

    @Override
    public void deleteGroup(Long id) {
        if (!userGroupRepository.existsById(id)) {
            throw new ResourceNotFoundException("Grup bulunamadı: " + id);
        }
        // Önce bu gruba ait tüm bağlantıları sil (FK kısıtı hatasını önlemek için)
        userGroupLinkRepository.findBySourceGroupId(id).forEach(userGroupLinkRepository::delete);
        userGroupLinkRepository.findByTargetGroupId(id).forEach(userGroupLinkRepository::delete);
        userGroupRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserGroupLinkDto> getAllLinks() {
        return userGroupLinkRepository.findAll().stream()
            .map(userGroupMapper::toLinkDto)
            .collect(Collectors.toList());
    }

    @Override
    public UserGroupLinkDto createLink(CreateUserGroupLinkDto dto) {
        if (dto.getSourceGroupId().equals(dto.getTargetGroupId())) {
            throw new IllegalArgumentException("Kaynak ve hedef grup aynı olamaz");
        }
        UserGroup source = userGroupRepository.findById(dto.getSourceGroupId())
            .orElseThrow(() -> new ResourceNotFoundException("Kaynak grup bulunamadı: " + dto.getSourceGroupId()));
        UserGroup target = userGroupRepository.findById(dto.getTargetGroupId())
            .orElseThrow(() -> new ResourceNotFoundException("Hedef grup bulunamadı: " + dto.getTargetGroupId()));

        List<UserGroupLink> existing = userGroupLinkRepository.findBySourceAndTarget(source.getId(), target.getId());
        if (!existing.isEmpty()) {
            return userGroupMapper.toLinkDto(existing.get(0));
        }

        UserGroupLink link = new UserGroupLink();
        link.setSourceGroup(source);
        link.setTargetGroup(target);
        link.setLinkLabel(dto.getLinkLabel());
        link = userGroupLinkRepository.save(link);
        return userGroupMapper.toLinkDto(link);
    }

    @Override
    public void deleteLink(Long linkId) {
        if (!userGroupLinkRepository.existsById(linkId)) {
            throw new ResourceNotFoundException("Bağlantı bulunamadı: " + linkId);
        }
        userGroupLinkRepository.deleteById(linkId);
    }

    @Override
    public UserGroupDto updateGroupPosition(Long id, Double positionX, Double positionY) {
        UserGroup group = userGroupRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Grup bulunamadı: " + id));
        if (positionX != null) group.setPositionX(positionX);
        if (positionY != null) group.setPositionY(positionY);
        group = userGroupRepository.save(group);
        return userGroupMapper.toDto(group);
    }

    @Override
    public void updateGroupPositions(List<UpdateGroupPositionsDto.GroupPositionItem> positions) {
        if (positions == null) return;
        for (UpdateGroupPositionsDto.GroupPositionItem item : positions) {
            userGroupRepository.findById(item.getId()).ifPresent(g -> {
                g.setPositionX(item.getPositionX());
                g.setPositionY(item.getPositionY());
                userGroupRepository.save(g);
            });
        }
    }

    @Override
    public UserGroupDto setGroupMembers(UserGroupMembersDto dto) {
        UserGroup group = userGroupRepository.findById(dto.getUserGroupId())
            .orElseThrow(() -> new ResourceNotFoundException("Grup bulunamadı: " + dto.getUserGroupId()));
        Set<User> members = new HashSet<>();
        if (dto.getUserIds() != null && !dto.getUserIds().isEmpty()) {
            for (Long userId : dto.getUserIds()) {
                userRepository.findById(userId).ifPresent(members::add);
            }
        }
        group.setMembers(members);
        group = userGroupRepository.save(group);
        return userGroupMapper.toDto(group);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findParentApproverForUser(User user) {
        if (user == null || user.getId() == null) return Optional.empty();
        List<UserGroup> userGroups = userGroupRepository.findByMembers_Id(user.getId());
        for (UserGroup group : userGroups) {
            List<UserGroupLink> inbound = userGroupLinkRepository.findByTargetGroupId(group.getId());
            if (inbound.isEmpty()) continue;
            UserGroupLink link = inbound.get(0);
            UserGroup parent = link.getSourceGroup();
            UserGroup parentWithMembers = userGroupRepository.findById(parent.getId()).orElse(null);
            if (parentWithMembers == null || parentWithMembers.getMembers() == null) continue;
            Optional<User> approver = parentWithMembers.getMembers().stream()
                .filter(m -> Boolean.TRUE.equals(m.getIsActive()) && !m.getId().equals(user.getId()))
                .findFirst();
            if (approver.isPresent()) return approver;
        }
        return Optional.empty();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParentApproverCandidateDto> findParentApproverCandidatesForUser(User user) {
        if (user == null || user.getId() == null) return List.of();
        List<ParentApproverCandidateDto> candidates = new ArrayList<>();
        List<UserGroup> userGroups = userGroupRepository.findByMembers_Id(user.getId());
        for (UserGroup group : userGroups) {
            List<UserGroupLink> inbound = userGroupLinkRepository.findByTargetGroupId(group.getId());
            for (UserGroupLink link : inbound) {
                UserGroup parent = link.getSourceGroup();
                UserGroup parentWithMembers = userGroupRepository.findById(parent.getId()).orElse(null);
                if (parentWithMembers == null) continue;
                String groupName = parent.getName() != null ? parent.getName() : "";
                java.util.Optional<User> approverOpt = parentWithMembers.getMembers() != null
                    ? parentWithMembers.getMembers().stream()
                        .filter(m -> Boolean.TRUE.equals(m.getIsActive()) && !m.getId().equals(user.getId()))
                        .findFirst()
                    : java.util.Optional.empty();
                if (approverOpt.isPresent()) {
                    User approver = approverOpt.get();
                    String userName = (approver.getFirstName() != null ? approver.getFirstName() + " " : "") + (approver.getLastName() != null ? approver.getLastName() : "").trim();
                    if (userName.isEmpty()) userName = approver.getEmail();
                    candidates.add(new ParentApproverCandidateDto(approver.getId(), userName, groupName));
                } else {
                    candidates.add(new ParentApproverCandidateDto(null, groupName + " (Üye atanmamış)", groupName));
                }
            }
        }
        return candidates;
    }
}
