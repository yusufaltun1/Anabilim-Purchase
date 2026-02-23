package com.anabilim.purchase.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * İki kullanıcı grubu arasındaki bağlantı (whiteboard'da ok).
 */
@Entity
@Table(name = "user_group_links")
@Getter
@Setter
public class UserGroupLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_group_id", nullable = false)
    private UserGroup sourceGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_group_id", nullable = false)
    private UserGroup targetGroup;

    @Column(name = "link_label", length = 255)
    private String linkLabel;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
