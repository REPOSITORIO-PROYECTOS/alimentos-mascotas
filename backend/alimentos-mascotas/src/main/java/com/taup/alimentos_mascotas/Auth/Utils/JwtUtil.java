package com.taup.alimentos_mascotas.Auth.Utils;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

	private final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS512);

	private final long EXPIRATION_TIME = 28800000; // 8 horas en milisegundos

	public String generateToken(String username, String[] roles) {
		return Jwts.builder()
				.setSubject(username)
				.claim("roles", roles)
				.setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
				.signWith(SECRET_KEY)
				.compact();
	}

	public Claims validateToken(String token) {
		try {
			return Jwts.parserBuilder()
					.setSigningKey(SECRET_KEY)
					.build()
					.parseClaimsJws(token)
					.getBody();
		} catch (JwtException e) {
			throw new JwtException("Token inválido (JWT UTIL): " + e.getMessage());
		}
	}

	public String createToken(String username) {
		return generateToken(username, new String[] { "ROLE_USER" });
	}

	public String getUsernameFromToken(String token) {
		return validateToken(token).getSubject();
	}

	public String[] getRolesFromToken(String token) {
		// Recupera el claim "roles" como una lista de objetos (List<Object>) y
		// convierte a String[]
		List<?> rolesList = validateToken(token).get("roles", List.class);
		return rolesList.stream()
				.map(role -> role.toString()) // Asegura que cada elemento sea convertido a String
				.toArray(String[]::new);
	}

}