package com.taup.alimentos_mascotas.Services.Profiles;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.DTO.UserInfo;
import com.taup.alimentos_mascotas.Repositories.Devs.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;

	public Mono<PagedResponse<UserInfo>> getUsersPaged(int page, int size, String keyword) {
		PageRequest pageRequest = PageRequest.of(page, size);

		if (keyword != null && !keyword.isEmpty()) {
			Mono<Long> totalElementsMono = userRepository.countByKeyword(keyword);
			Flux<UserInfo> userFlux = userRepository.findByKeywordPaged(keyword, pageRequest)
					.map(UserInfo::new);

			return Mono.zip(totalElementsMono, userFlux.collectList())
					.map(tuple -> new PagedResponse<>(
							tuple.getT2(), // Lista de usuarios filtrados
							tuple.getT1(), // Total de registros filtrados
							page,
							size));
		}

		Mono<Long> totalElementsMono = userRepository.count();
		Flux<UserInfo> userFlux = userRepository.findUsersPaged(pageRequest)
				.map(UserInfo::new);

		return Mono.zip(totalElementsMono, userFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(), // Total de registros
						page,
						size));
	}

	public Mono<UserInfo> findById(String id) {
		return userRepository.findById(id).map(UserInfo::new);
	}

	public Mono<String> getFullName(String email) {
		return userRepository.findByEmail(email)
				.switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
						"No se encontró el usuario: " + email)))
				.map(user -> user.getName() + " " + user.getSurname());
	}

}