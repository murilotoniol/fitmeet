package com.bootcamp.desafio_backend.security;

import com.bootcamp.desafio_backend.exceptions.BusinessException;
import com.bootcamp.desafio_backend.exceptions.ErrorCode;
import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void loadUserByUsername_WhenUserExists_ReturnsUserDetails() {
        User user = buildUser();
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        assertInstanceOf(UserDetailsImpl.class, userDetails);
        assertSame(user, ((UserDetailsImpl) userDetails).getUser());
        assertEquals(user.getEmail(), userDetails.getUsername());
    }

    @Test
    void loadUserByUsername_WhenUserDoesNotExist_ThrowsBusinessException() {
        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> userDetailsService.loadUserByUsername("missing@test.com")
        );

        assertEquals(ErrorCode.E4, exception.getErrorCode());
    }

    private User buildUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@test.com");
        user.setPassword("hashed-password");
        return user;
    }
}
