package com.taup.alimentos_mascotas.Auth.Services;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.taup.alimentos_mascotas.Auth.Utils.JwtUtil;
import com.taup.alimentos_mascotas.DTO.UserCredentialsDTO;
import com.taup.alimentos_mascotas.DTO.UserInfo;
import com.taup.alimentos_mascotas.Exceptions.UserNotFoundException;
import com.taup.alimentos_mascotas.Models.Profiles.User;
import com.taup.alimentos_mascotas.Repositories.Devs.UserRepository;
import com.taup.alimentos_mascotas.Services.Profiles.UserService;

import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor

 public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;
	private final UserService userService;
    
    // Métodos para registrar diferentes tipos de usuarios
    public Mono<User> registerUser(UserInfo userDetails) {
        return Mono.just("")
            .flatMap(name -> {
                User user = new User();
                user.setEmail(userDetails.getEmail());
                user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                user.setName(userDetails.getName());
                user.setSurname(userDetails.getSurname());
                user.setPhone(userDetails.getPhone());
                user.setDni(userDetails.getDni());
                user.setCreatedBy("Himself");
                user.setCreatedAt(LocalDateTime.now());
                user.setModifiedBy("");
                user.setUpdatedAt(LocalDateTime.now());

                // ✅ Validar roles
                Set<String> incomingRoles = userDetails.getRoles();
                if (incomingRoles == null || incomingRoles.isEmpty()) {
                    user.setRoles(Set.of("ROLE_CLIENT"));
                } else {
                    // Solo permitir ROLE_CLIENT
                    if (incomingRoles.size() == 1 && incomingRoles.contains("ROLE_CLIENT")) {
                        user.setRoles(incomingRoles);
                    } else {
                        // Lanzar error si intentan mandar admin
                        return Mono.error(new RuntimeException("Rol inválido en registro de usuario."));
                    }
                }

                return userRepository.save(user);
            })
            .onErrorMap(e -> new RuntimeException("Error al registrar el usuario", e));
    }



    public Mono<User> updateUserProfile(UserInfo userDetails, String username) {
        return userService.getFullName(username)
            .flatMap(name -> userRepository.findByEmail(username)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
                .flatMap(existingUser -> {
                    existingUser.setEmail(userDetails.getEmail() != null && !userDetails.getEmail().isEmpty() ? userDetails.getEmail() : existingUser.getEmail());
                    existingUser.setPassword(userDetails.getPassword() != null && !userDetails.getPassword().isEmpty() ? passwordEncoder.encode(userDetails.getPassword()) : existingUser.getPassword());
                    existingUser.setName(userDetails.getName() != null && !userDetails.getName().isEmpty() ? userDetails.getName() : existingUser.getName());
                    existingUser.setSurname(userDetails.getSurname() != null && !userDetails.getSurname().isEmpty() ? userDetails.getSurname() : existingUser.getSurname());
                    existingUser.setDni(userDetails.getDni() != null && !userDetails.getDni().isEmpty() ? userDetails.getDni() : existingUser.getDni());
                    existingUser.setPhone(userDetails.getPhone() != null && !userDetails.getPhone().isEmpty() ? userDetails.getPhone() : existingUser.getPhone());
    
                    // Auditoría
                    existingUser.setModifiedBy(name.getName() + " " + name.getSurname());
                    existingUser.setUpdatedAt(LocalDateTime.now());
    
                    return userRepository.save(existingUser);
                })
            )
            .onErrorMap(e -> new RuntimeException("Error al actualizar el perfil del usuario", e));
    }

    // Métodos para actualizar diferentes tipos de usuarios
    public Mono<User> updateUser(UserInfo userDetails, String username, String userId) {
        return userService.getFullName(username)
            .flatMap(name -> userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
                .flatMap(existingUser -> {
                    boolean isTargetAdmin = existingUser.getRoles().contains("ROLE_ADMIN");
                    boolean isRequesterAdmin = name.getRoles().contains("ROLE_ADMIN"); // Asumiendo este método

                    if (isTargetAdmin && !isRequesterAdmin) {
                        return Mono.error(new RuntimeException("No tienes permisos para editar un usuario administrador"));
                    }
                    existingUser.setEmail(userDetails.getEmail());
                    existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                    existingUser.setName(userDetails.getName());
                    existingUser.setSurname(userDetails.getSurname());
                    existingUser.setDni(userDetails.getDni());
                    existingUser.setRoles(userDetails.getRoles());
                    existingUser.setPhone(userDetails.getPhone());
                    existingUser.setModifiedBy(name.getName() + " " + name.getSurname());
                    existingUser.setUpdatedAt(LocalDateTime.now());
                    return userRepository.save(existingUser);
                })
            )
            .onErrorMap(e -> new RuntimeException("Error al actualizar el usuario", e));
    }

    // Métodos para eliminar diferentes tipos de usuarios
    public Mono<Void> deleteUser(String userId) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No se encontró el usuario con ID: " + userId)))
                .flatMap(userRepository::delete);
    }

	public Mono<UserCredentialsDTO> login(String email, String password) {
        return userRepository.findByEmail(email)
        .flatMap(user -> authenticateUser(user, user.getEmail(), password));
    }

    public Mono<UserCredentialsDTO> authenticateUser(User user, String username, String password) {
        if (passwordEncoder.matches(password, user.getPassword())) {
            String token = jwtUtil.generateToken(user.getEmail(),
                    user.getRoles().toArray(new String[0]));
            return userService.getFullName(username)
                    .flatMap(name -> {
                        UserCredentialsDTO credentialsDTO = new UserCredentialsDTO();
                        credentialsDTO.setId(user.getId());
                        credentialsDTO.setToken(token);
                        credentialsDTO.setName(name.getName() + " " + name.getSurname());
                        credentialsDTO.setUsername(username);
                        credentialsDTO.setRoles(user.getRoles());
                        return Mono.just(credentialsDTO);
                    });
        } else {
            return Mono.error(new RuntimeException("Credenciales incorrectas"));
        }
    }
    
}