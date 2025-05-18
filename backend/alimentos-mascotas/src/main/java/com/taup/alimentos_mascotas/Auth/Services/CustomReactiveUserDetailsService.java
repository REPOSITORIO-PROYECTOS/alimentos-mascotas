package com.taup.alimentos_mascotas.Auth.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.taup.alimentos_mascotas.Repositories.Devs.UserRepository;

import reactor.core.publisher.Mono;

@Service
public class CustomReactiveUserDetailsService implements ReactiveUserDetailsService {

	@Autowired
	private final UserRepository userRepository;

	public CustomReactiveUserDetailsService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public Mono<UserDetails> findByUsername(String username) {
		return userRepository.findByEmail(username)
				.map(user -> User.builder()
						.username(user.getEmail())
						.password(user.getPassword())
						.roles(user.getRoles().toArray(new String[0]))
						.build());
	}
}