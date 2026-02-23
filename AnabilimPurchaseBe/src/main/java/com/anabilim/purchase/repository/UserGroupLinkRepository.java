package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.UserGroupLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserGroupLinkRepository extends JpaRepository<UserGroupLink, Long> {

    List<UserGroupLink> findBySourceGroupId(Long sourceGroupId);

    List<UserGroupLink> findByTargetGroupId(Long targetGroupId);

    @Query("SELECT l FROM UserGroupLink l WHERE l.sourceGroup.id = :sourceId AND l.targetGroup.id = :targetId")
    List<UserGroupLink> findBySourceAndTarget(@Param("sourceId") Long sourceId, @Param("targetId") Long targetId);
}
