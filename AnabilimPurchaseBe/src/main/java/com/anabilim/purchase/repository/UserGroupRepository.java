package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.UserGroup;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserGroupRepository extends JpaRepository<UserGroup, Long> {

    @EntityGraph(attributePaths = {"members"})
    @Override
    List<UserGroup> findAll();

    @EntityGraph(attributePaths = {"members"})
    @Override
    java.util.Optional<UserGroup> findById(Long id);

    /** Kullanıcının üye olduğu grupları getirir (ağaçta üst onaycı bulmak için). */
    List<UserGroup> findByMembers_Id(Long userId);
}
