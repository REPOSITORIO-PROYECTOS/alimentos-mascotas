package com.taup.alimentos_mascotas.Repositories.Admins.Finance;

import com.taup.alimentos_mascotas.Models.Admins.Finance.Provider;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface ProviderRepository extends ReactiveMongoRepository<Provider, String> {
	@Query("{}")
	Flux<Provider> findProvidersPaged(PageRequest pageRequest);
}