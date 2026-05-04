package com.bootcamp.desafio_backend.security;

import com.bootcamp.desafio_backend.models.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

class UserDetailsImplTest {

    @Test
    void userDetails_DelegatesUserData() {
        User user = buildUser();
        UserDetailsImpl userDetails = new UserDetailsImpl(user);

        assertSame(user, userDetails.getUser());
        assertEquals(user.getEmail(), userDetails.getUsername());
        assertEquals(user.getPassword(), userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().isEmpty());
        assertTrue(userDetails.isAccountNonExpired());
        assertTrue(userDetails.isAccountNonLocked());
        assertTrue(userDetails.isCredentialsNonExpired());
        assertTrue(userDetails.isEnabled());
    }

    @Test
    void isEnabled_WhenUserIsDeactivated_ReturnsFalse() {
        User user = buildUser();
        user.setDeletedAt(LocalDateTime.now());

        UserDetailsImpl userDetails = new UserDetailsImpl(user);

        assertFalse(userDetails.isEnabled());
    }

    private User buildUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@test.com");
        user.setPassword("hashed-password");
        return user;
    }
}
