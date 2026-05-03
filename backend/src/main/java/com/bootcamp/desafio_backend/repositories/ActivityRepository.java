package com.bootcamp.desafio_backend.repositories;

import com.bootcamp.desafio_backend.models.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    Page<Activity> findByType_IdAndDeletedAtIsNullAndCompletedAtIsNull(UUID typeId, Pageable pageable);

    List<Activity> findByType_IdAndDeletedAtIsNullAndCompletedAtIsNull(UUID typeId, Sort sort);

    List<Activity> findByDeletedAtIsNullAndCompletedAtIsNull(Sort sort);

    Page<Activity> findByCreatorIdAndDeletedAtIsNull(UUID creatorId, Pageable pageable);

    List<Activity> findByCreatorIdAndDeletedAtIsNull(UUID creatorId, Sort sort);

    Optional<Activity> findByIdAndDeletedAtIsNull(UUID id);
}
