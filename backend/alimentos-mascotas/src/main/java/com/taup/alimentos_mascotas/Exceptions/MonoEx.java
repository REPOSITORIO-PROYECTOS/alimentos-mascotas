package com.taup.alimentos_mascotas.Exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

public class MonoEx {
	public static <T> Mono<T> monoError(HttpStatus status, String message) {
		return Mono.error(new ResponseStatusException(status, message));
	}
}
