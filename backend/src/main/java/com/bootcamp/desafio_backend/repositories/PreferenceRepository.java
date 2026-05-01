package com.bootcamp.desafio_backend.repositories;

import com.bootcamp.desafio_backend.models.Preference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PreferenceRepository extends JpaRepository<Preference,  UUID> {

    List<Preference> findByUserId(UUID userId);

    void deleteByUserId(UUID userId);
}
