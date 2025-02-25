package com.taup.alimentos_mascotas.Repositories.Admins.Management;

import com.taup.alimentos_mascotas.Models.Admins.Management.Ingredient;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.repository.CountQuery;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface IngredientRepository extends ReactiveMongoRepository<Ingredient, String> {

	@Query("{$or: [ { 'ingredientName': {$regex: ?0, options: 'i' }, { 'ingredientDescription': { $regex: ?0, $options: 'i'}} ] }")
	Flux<Ingredient> findByKeyword(String keyword, PageRequest pageRequest);

	@CountQuery(value = "{$or: [ { 'ingredientName': {$regex: ?0, options: 'i' }, { 'ingredientDescription': { $regex: ?0, $options: 'i'}} ] }")
	Mono<Long> countByKeyword(String keyword);

	@Query("{}")
	Flux<Ingredient> findIngredientsPaged(PageRequest pageRequest);
}
