package com.taup.alimentos_mascotas.Auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import reactor.core.publisher.Mono;

public class CustomReactiveAuthenticationManager implements ReactiveAuthenticationManager {

	@Autowired
	private final ReactiveUserDetailsService userDetailsService;
	@Autowired
	private final PasswordEncoder passwordEncoder;

	public CustomReactiveAuthenticationManager(ReactiveUserDetailsService userDetailsService,
	                                           PasswordEncoder passwordEncoder) {
		this.userDetailsService = userDetailsService;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public Mono<Authentication> authenticate(Authentication authentication) {

		return userDetailsService.findByUsername(authentication.getName())
				.flatMap(userDetails -> {

					if (passwordEncoder.matches(authentication.getCredentials().toString(),
							userDetails.getPassword())) {
						return Mono.just(new UsernamePasswordAuthenticationToken(userDetails,
								authentication.getCredentials(), userDetails.getAuthorities()));
					}
					return Mono.empty();
				});
	}
}