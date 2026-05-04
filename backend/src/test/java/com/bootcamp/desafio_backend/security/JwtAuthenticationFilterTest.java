package com.bootcamp.desafio_backend.security;

import com.bootcamp.desafio_backend.exceptions.BusinessException;
import com.bootcamp.desafio_backend.exceptions.ErrorCode;
import com.bootcamp.desafio_backend.models.User;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;
    @Mock
    private UserDetailsService userDetailsService;
    @Mock
    private HandlerExceptionResolver handlerExceptionResolver;
    @Mock
    private FilterChain filterChain;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_WithoutBearerToken_ContinuesWithoutAuthentication() throws Exception {
        JwtAuthenticationFilter filter = buildFilter();
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
        verify(jwtService, never()).extractSubject(any());
    }

    @Test
    void doFilterInternal_WithValidToken_AuthenticatesAndContinues() throws Exception {
        JwtAuthenticationFilter filter = buildFilter();
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        User user = buildActiveUser();
        UserDetailsImpl userDetails = new UserDetailsImpl(user);

        request.addHeader("Authorization", "Bearer valid-token");
        when(jwtService.extractSubject("valid-token")).thenReturn(user.getEmail());
        when(userDetailsService.loadUserByUsername(user.getEmail())).thenReturn(userDetails);
        when(jwtService.isTokenValid("valid-token", user)).thenReturn(true);

        filter.doFilterInternal(request, response, filterChain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertSame(userDetails, authentication.getPrincipal());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_WhenUserIsDisabled_DelegatesExceptionToResolver() throws Exception {
        JwtAuthenticationFilter filter = buildFilter();
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        User user = buildActiveUser();
        user.setDeletedAt(LocalDateTime.now());
        UserDetailsImpl userDetails = new UserDetailsImpl(user);

        request.addHeader("Authorization", "Bearer valid-token");
        when(jwtService.extractSubject("valid-token")).thenReturn(user.getEmail());
        when(userDetailsService.loadUserByUsername(user.getEmail())).thenReturn(userDetails);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, never()).doFilter(request, response);
        verify(handlerExceptionResolver).resolveException(
                any(),
                any(),
                isNull(),
                org.mockito.ArgumentMatchers.argThat(exception ->
                        exception instanceof BusinessException businessException
                                && businessException.getErrorCode() == ErrorCode.E6
                )
        );
    }

    @Test
    void doFilterInternal_WhenTokenIsInvalid_DelegatesExceptionToResolver() throws Exception {
        JwtAuthenticationFilter filter = buildFilter();
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        User user = buildActiveUser();
        UserDetailsImpl userDetails = new UserDetailsImpl(user);

        request.addHeader("Authorization", "Bearer invalid-token");
        when(jwtService.extractSubject("invalid-token")).thenReturn(user.getEmail());
        when(userDetailsService.loadUserByUsername(user.getEmail())).thenReturn(userDetails);
        when(jwtService.isTokenValid("invalid-token", user)).thenReturn(false);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, never()).doFilter(request, response);
        verify(handlerExceptionResolver).resolveException(
                any(),
                any(),
                isNull(),
                org.mockito.ArgumentMatchers.argThat(exception ->
                        exception instanceof BusinessException businessException
                                && businessException.getErrorCode() == ErrorCode.E19
                )
        );
    }

    @Test
    void doFilterInternal_WhenUnexpectedExceptionOccurs_DelegatesExceptionToResolver() throws Exception {
        JwtAuthenticationFilter filter = buildFilter();
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        RuntimeException exception = new RuntimeException("boom");

        request.addHeader("Authorization", "Bearer invalid-token");
        when(jwtService.extractSubject("invalid-token")).thenThrow(exception);

        filter.doFilterInternal(request, response, filterChain);

        verify(handlerExceptionResolver).resolveException(request, response, null, exception);
    }

    private JwtAuthenticationFilter buildFilter() {
        return new JwtAuthenticationFilter(jwtService, userDetailsService, handlerExceptionResolver);
    }

    private User buildActiveUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@test.com");
        user.setPassword("hashed-password");
        return user;
    }
}
