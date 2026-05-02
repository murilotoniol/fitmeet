package com.bootcamp.desafio_backend.repositories;

import com.bootcamp.desafio_backend.models.ActivityAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ActivityAddressRepository extends JpaRepository<ActivityAddress, UUID> {

    Optional<ActivityAddress> findByActivityId(UUID activityId);
}
