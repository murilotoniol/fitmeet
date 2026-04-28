package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.dtos.UserRegisterDTO;
import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void register(UserRegisterDTO dto) {

        User newUser = new User();
        BeanUtils.copyProperties(dto, newUser);

        newUser.setPassword(passwordEncoder.encode(dto.password()));

        userRepository.save(newUser);
    }
}
