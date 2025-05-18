package com.taup.alimentos_mascotas.Auth.Filters;

import java.time.Duration;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;

import com.taup.alimentos_mascotas.Auth.Utils.JwtUtil;

import reactor.core.publisher.Mono;

//@Component
public class JwtCookieFilter{ //implements WebFilter {

    // private final JwtUtil jwtUtil;

    // public JwtCookieFilter(JwtUtil jwtUtil) {
    //     this.jwtUtil = jwtUtil;
    // }

    //@Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        //String token = jwtUtil.createToken("username"); // Aquí 'username' debe ser el nombre del usuario autenticado.

        // Crea la cookie con el token JWT
        // ResponseCookie cookie = ResponseCookie.from("JWT", token)
        //         .httpOnly(true)
        //         .secure(true)  // Solo si usas HTTPS
        //         .path("/")  // Hace que la cookie esté disponible en toda la aplicación
        //         .maxAge(Duration.ofHours(8))  // Duración del token en segundos (1 hora)
        //         .build();

        // // Agrega la cookie a la respuesta
        // exchange.getResponse().addCookie(cookie);

        // Continúa con el siguiente filtro de la cadena
        return chain.filter(exchange);
    }
}

