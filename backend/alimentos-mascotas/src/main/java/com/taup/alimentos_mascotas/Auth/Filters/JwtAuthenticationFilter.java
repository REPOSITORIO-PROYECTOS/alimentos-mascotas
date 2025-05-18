package com.taup.alimentos_mascotas.Auth.Filters;

import java.util.Arrays;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;

import com.taup.alimentos_mascotas.Auth.Utils.JwtUtil;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter implements ServerAuthenticationConverter {

	private final JwtUtil jwtUtil;

	public JwtAuthenticationFilter(JwtUtil jwtUtil) {
		this.jwtUtil = jwtUtil;
	}

	@Override
	public Mono<Authentication> convert(ServerWebExchange exchange) {
		String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			return Mono.empty();
		}

		String token = authHeader.substring(7);
		try {
			// Valida el token
			Claims claims = jwtUtil.validateToken(token);
			String username = claims.getSubject(); // Obtiene el nombre de usuario desde el token
			String[] roles = jwtUtil.getRolesFromToken(token); // Obtiene los roles

			// Crea un objeto de autenticación con los roles
			return Mono.just(new UsernamePasswordAuthenticationToken(
					username, null, Arrays.stream(roles)
					.map(SimpleGrantedAuthority::new) // Mapear los roles a Authorities
					.collect(Collectors.toList())));
		} catch (JwtException e) {
			// Si el token es inválido o no se puede verificar, lanza un error
			return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED,
					"Token inválido."));
		}
	}
}