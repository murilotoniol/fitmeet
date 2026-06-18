package com.bootcamp.desafio_backend.repositories;

import com.bootcamp.desafio_backend.enums.ParticipationStatus;
import com.bootcamp.desafio_backend.models.ActivityParticipant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ActivityParticipantRepository extends JpaRepository<ActivityParticipant, UUID> {

    Optional<ActivityParticipant> findByActivityIdAndUserId(UUID activityId, UUID userId);

    boolean existsByActivityIdAndUserId(UUID activityId, UUID userId);

    int countByActivityId(UUID activityId);

    Page<ActivityParticipant> findByUserIdAndActivityDeletedAtIsNull(UUID userId, Pageable pageable);

    List<ActivityParticipant> findByUserIdAndActivityDeletedAtIsNull(UUID userId, Sort sort);

    List<ActivityParticipant> findByActivityId(UUID activityId);

    Optional<ActivityParticipant> findByIdAndActivityId(UUID participantId, UUID activityId);

    long countByUserIdAndStatus(UUID userId, ParticipationStatus status);
}
