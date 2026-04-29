package com.bootcamp.desafio_backend.repositories;

import com.bootcamp.desafio_backend.models.ActivityParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ActivityParticipantRepository extends JpaRepository<ActivityParticipant, UUID> {

    Optional<ActivityParticipant> findByActivityIdAndUserId(UUID activityId, UUID userId);

    boolean existsByActivityIdAndUserId(UUID activityId, UUID userId);
}
