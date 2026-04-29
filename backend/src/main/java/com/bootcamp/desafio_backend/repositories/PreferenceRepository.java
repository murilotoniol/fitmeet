package com.bootcamp.desafio_backend.repositories;

import com.bootcamp.desafio_backend.models.Preference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PreferenceRepository extends JpaRepository<Preference,  UUID> {
}
