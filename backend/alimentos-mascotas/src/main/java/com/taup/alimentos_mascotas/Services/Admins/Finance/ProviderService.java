package com.taup.alimentos_mascotas.Services.Admins.Finance;


import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Models.Admins.Finance.Provider;
import com.taup.alimentos_mascotas.Repositories.Admins.Finance.ProviderRepository;
import com.taup.alimentos_mascotas.Services.Profiles.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProviderService {

	private final UserService userService;
	private final ProviderRepository providerRepo;

	// ? ==================== MÉTODOS PÚBLICOS ====================

	public Mono<PagedResponse<Provider>> getProvidersPaged(int page, int size) {
		PageRequest pageRequest = PageRequest.of(page, size);
		Mono<Long> totalElementsMono = providerRepo.count();
		Flux<Provider> providersFlux = providerRepo.findProvidersPaged(pageRequest);

		return Mono.zip(totalElementsMono, providersFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(), // Lista de proveedores
						tuple.getT1(), // Total de registros
						page,
						size));
	}

	public Mono<Provider> getProviderById(String providerId) {
		return providerRepo.findById(providerId)
				.switchIfEmpty(Mono.error(
						new ResponseStatusException(HttpStatus.NOT_FOUND, "Proveedor no encontrado con el ID: " + providerId)));
	}

	public Mono<Provider> saveProvider(Provider provider, String username) {
		if (provider.getId() != null && !provider.getId().isEmpty()) {
			return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"El proveedor ya tiene un ID registrado. No se puede almacenar un proveedor con ID ya registrado."));
		}

		return userService.getFullName(username)
				.flatMap(fullName -> {
					provider.setCreatedAt(LocalDateTime.now());
					provider.setCreatedBy(fullName);
					return providerRepo.save(provider);
				});
	}

	public Mono<Provider> updateProvider(Provider provider, String providerId, String username) {
		if (!provider.getId().equals(providerId)) {
			return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Los IDs del proveedor a actualizar no coinciden."));
		}

		return providerRepo.findById(providerId)
				.switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
						"No se encontró el proveedor con ID: " + providerId)))
				.flatMap(existingProvider -> userService.getFullName(username)
						.flatMap(fullName -> {
							Provider updatedProvider = mappingProviderToUpdate(existingProvider, provider, fullName);
							return providerRepo.save(updatedProvider);
						}));
	}

	public Mono<Void> deleteProvider(String providerId) {
		return providerRepo.findById(providerId)
				.switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
						"No se encontró el proveedor para eliminar con ID: " + providerId)))
				.flatMap(providerRepo::delete);
	}

	// ? ==================== MÉTODOS PRIVADOS ====================

	/**
	 * Mapea los campos de un proveedor existente con los de un proveedor actualizado.
	 */
	private Provider mappingProviderToUpdate(Provider existingProvider, Provider provider, String fullName) {
		existingProvider.setName(provider.getName());
		existingProvider.setAddress(provider.getAddress());
		existingProvider.setPhone(provider.getPhone());
		existingProvider.setCuilCuit(provider.getCuilCuit());
		existingProvider.setDescription(provider.getDescription());
		existingProvider.setIsActive(provider.getIsActive());
		existingProvider.setUpdatedAt(LocalDateTime.now());
		existingProvider.setModifiedBy(fullName);
		return existingProvider;
	}
}