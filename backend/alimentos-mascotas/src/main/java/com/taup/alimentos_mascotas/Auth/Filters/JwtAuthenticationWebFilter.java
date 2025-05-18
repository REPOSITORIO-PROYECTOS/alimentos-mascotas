package com.taup.alimentos_mascotas.Auth.Filters;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;

import com.taup.alimentos_mascotas.Auth.Utils.JwtUtil;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationWebFilter implements WebFilter {

	private final JwtUtil jwtUtil;

	public JwtAuthenticationWebFilter(JwtUtil jwtUtil) {
		this.jwtUtil = jwtUtil;
	}

	@Override
	public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
		String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String token = authHeader.substring(7);

			try {
				Claims claims = jwtUtil.validateToken(token);
				String username = claims.getSubject();
				String[] roles = jwtUtil.getRolesFromToken(token);

				List<SimpleGrantedAuthority> authorities = Arrays.stream(roles)
						.map(SimpleGrantedAuthority::new)
						.collect(Collectors.toList());

				Authentication authentication = new UsernamePasswordAuthenticationToken(
						username, null, authorities);

				// Establece el contexto de seguridad reactivo
				SecurityContext securityContext = new SecurityContextImpl(authentication);

				// Continúa con el siguiente filtro en la cadena, adjuntando el contexto de seguridad
				return chain.filter(exchange)
						.contextWrite(ReactiveSecurityContextHolder.withSecurityContext(Mono.just(securityContext)));

			} catch (JwtException e) {
				// Retorna una respuesta personalizada sin el stack trace
				exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
				String responseBody = "{\"message\": \"Token inválido\"}";
				return exchange.getResponse().writeWith(Mono.just(exchange.getResponse()
						.bufferFactory()
						.wrap(responseBody.getBytes(StandardCharsets.UTF_8))));
			}
		}

		// Si no hay encabezado de autorización, continuar sin contexto de seguridad
		return chain.filter(exchange);
	}

}