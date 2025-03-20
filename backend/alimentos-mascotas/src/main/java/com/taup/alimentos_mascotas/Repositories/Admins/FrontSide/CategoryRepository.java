package com.taup.alimentos_mascotas.Repositories.Admins.FrontSide;

import com.taup.alimentos_mascotas.Models.Admins.FrontSide.Category;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;

public interface CategoryRepository extends ReactiveMongoRepository<Category, String> {

	@Query("{}")
	Flux<Category> findCategoriesPaged();

}
