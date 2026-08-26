package com.bezkoder.springjwt.controllers;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.bezkoder.springjwt.models.ERole;
import com.bezkoder.springjwt.models.Role;
import com.bezkoder.springjwt.models.User;
import com.bezkoder.springjwt.payload.request.LoginRequest;
import com.bezkoder.springjwt.payload.request.SignupRequest;
import com.bezkoder.springjwt.payload.response.JwtResponse;
import com.bezkoder.springjwt.payload.response.MessageResponse;
import com.bezkoder.springjwt.repository.RoleRepository;
import com.bezkoder.springjwt.repository.UserRepository;
import com.bezkoder.springjwt.security.jwt.JwtUtils;
import com.bezkoder.springjwt.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

  @Autowired
  AuthenticationManager authenticationManager;

  @Autowired
  UserRepository userRepository;

  @Autowired
  RoleRepository roleRepository;

  @Autowired
  PasswordEncoder encoder;

  @Autowired
  JwtUtils jwtUtils;

  /**
   * POST /api/auth/signin
   * Accepts: { "username": "email@example.com", "password": "..." }
   * Supports login by EITHER username OR email.
   */
  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    try {
      // Support login by email: look up username from DB if input looks like an email
      String loginIdentifier = loginRequest.getUsername();
      String usernameForAuth = loginIdentifier;

      if (loginIdentifier.contains("@")) {
        // Login by email - look up the username
        User userByEmail = userRepository.findByEmail(loginIdentifier).orElse(null);
        if (userByEmail == null) {
          return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
              .body(new MessageResponse("Error: No account found with this email. Please register first."));
        }
        usernameForAuth = userByEmail.getUsername();
      } else {
        // Login by username - check if user exists
        boolean exists = userRepository.existsByUsername(loginIdentifier);
        if (!exists) {
          return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
              .body(new MessageResponse("Error: User not found. Please register first."));
        }
      }

      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(usernameForAuth, loginRequest.getPassword()));

      SecurityContextHolder.getContext().setAuthentication(authentication);
      String jwt = jwtUtils.generateJwtToken(authentication);

      UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
      List<String> roles = userDetails.getAuthorities().stream()
          .map(item -> item.getAuthority())
          .collect(Collectors.toList());

      return ResponseEntity.ok(new JwtResponse(jwt,
          userDetails.getId(),
          userDetails.getUsername(),
          userDetails.getEmail(),
          roles));

    } catch (BadCredentialsException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(new MessageResponse("Error: Incorrect password. Please try again."));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new MessageResponse("Error: Authentication failed. " + e.getMessage()));
    }
  }

  /**
   * POST /api/auth/signup
   * Accepts: { "username": "...", "email": "...", "password": "...", "role": ["user"] }
   */
  @PostMapping("/signup")
  public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
    try {
      if (userRepository.existsByUsername(signUpRequest.getUsername())) {
        return ResponseEntity.badRequest()
            .body(new MessageResponse("Error: Username '" + signUpRequest.getUsername() + "' is already taken. Please choose another."));
      }

      if (userRepository.existsByEmail(signUpRequest.getEmail())) {
        return ResponseEntity.badRequest()
            .body(new MessageResponse("Error: Email '" + signUpRequest.getEmail() + "' is already registered. Please sign in instead."));
      }

      // Create new user with bcrypt-hashed password
      User user = new User(
          signUpRequest.getUsername(),
          signUpRequest.getEmail(),
          encoder.encode(signUpRequest.getPassword()));

      // Always assign ROLE_USER — auto-create if missing in DB
      Set<Role> roles = new HashSet<>();
      Role userRole = roleRepository.findByName(ERole.ROLE_USER)
          .orElseGet(() -> {
            Role newRole = new Role(ERole.ROLE_USER);
            return roleRepository.save(newRole);
          });
      roles.add(userRole);

      user.setRoles(roles);
      userRepository.save(user);

      return ResponseEntity.ok(new MessageResponse("User registered successfully! You can now sign in."));

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new MessageResponse("Error: Registration failed. " + e.getMessage()));
    }
  }
}
