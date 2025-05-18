package com.taup.alimentos_mascotas.Auth.Configs;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.userdetails.MapReactiveUserDetailsService;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import com.taup.alimentos_mascotas.Auth.CustomReactiveAuthenticationManager;
import com.taup.alimentos_mascotas.Auth.Filters.JwtAuthenticationWebFilter;

@EnableWebFluxSecurity
@Configuration
public class SpringSecurityConfig {
	@Bean
	public CustomReactiveAuthenticationManager customReactiveAuthenticationManager(
			ReactiveUserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
		return new CustomReactiveAuthenticationManager(userDetailsService, passwordEncoder);
	}

	@Bean
	public CorsWebFilter corsWebFilter() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(List.of("http://localhost:3000"));
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
		config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
		config.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);

		return new CorsWebFilter(source);
	}

	@Bean
	SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http, JwtAuthenticationWebFilter jwtAuthenticationFilter) {

		return http
				.addFilterAt(corsWebFilter(), SecurityWebFiltersOrder.CORS)
				.csrf(ServerHttpSecurity.CsrfSpec::disable)
				.authorizeExchange(exchanges -> {
					// ? ENDPOINTS PÚBLICOS
					exchanges.pathMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/registrar", "/api/mercadopago/notificaciones").permitAll();
					exchanges.pathMatchers(HttpMethod.GET, "/api/productos-front/**", "/api/resenas/pagina", 
					"/api/resenas/mejores/{productId}").permitAll();
					exchanges.pathMatchers("/webjars/**", "/swagger-ui.html", "/swagger-ui/**",
							"/v3/api-docs/**", "/swagger-resources/**").permitAll();

					// ? ENDPOINTS PRIVADOS
					//restrictEndpoints(exchanges, HttpMethod.POST, );

					authenticateEndpoints(exchanges, "/api/ventas/**", "/api/ingredientes/**",
					 		"/api/productos/**", "/api/recetas/**", "/api/ordenes-compra/**", "/api/resenas/guardar", "/api/resenas/editar/{reviewId}", "/api/ordenes-trabajo/**");

					exchanges.anyExchange().authenticated();
				})
				.addFilterAt(jwtAuthenticationFilter, SecurityWebFiltersOrder.AUTHENTICATION)
				.httpBasic(Customizer.withDefaults())
				.build();
	}

	// **Método auxiliar para endpoints autenticados
	private void authenticateEndpoints(ServerHttpSecurity.AuthorizeExchangeSpec exchanges, String... paths) {
		for (String path : paths) {
			exchanges.pathMatchers(HttpMethod.GET, path).authenticated();
			exchanges.pathMatchers(HttpMethod.POST, path).authenticated();
			exchanges.pathMatchers(HttpMethod.PUT, path).authenticated();
		}
	}

	// **Método auxiliar para restricciones de ADMIN & DEV
	private void restrictEndpoints(ServerHttpSecurity.AuthorizeExchangeSpec exchanges, HttpMethod method,
	                               String... paths) {
		for (String path : paths) {
			exchanges.pathMatchers(method, path).hasAnyAuthority("ROLE_ADMIN", "ROLE_DEV");
		}
	}

	// **Método auxiliar para logs de desarrollo
	private void devsEndpoints(ServerHttpSecurity.AuthorizeExchangeSpec exchanges, String... paths) {
		for (String path : paths) {
			exchanges.pathMatchers(HttpMethod.GET, path).hasAnyAuthority("ROLE_DEV");
			exchanges.pathMatchers(HttpMethod.POST, path).hasAnyAuthority("ROLE_DEV");
			exchanges.pathMatchers(HttpMethod.PUT, path).hasAnyAuthority("ROLE_DEV");
		}
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	@Primary
	public MapReactiveUserDetailsService userDetailsService() {
		UserDetails user = User
				.withUsername("user")
				.password(passwordEncoder().encode("password"))
				.roles("USER")
				.build();
		return new MapReactiveUserDetailsService(user);
	}
}