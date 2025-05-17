package com.taup.alimentos_mascotas.Repositories.Admins.Management;

import com.taup.alimentos_mascotas.Models.Admins.Management.Product;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.repository.CountQuery;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface ProductRepository extends ReactiveMongoRepository<Product, String> {

	@Query("{$or: [ { 'productName': {$regex: ?0, options: 'i' }, { 'productDescription': { $regex: ?0, $options: 'i'}} ] }")
	Flux<Product> findByKeyword(String keyword, PageRequest pageRequest);

	@CountQuery("{$or: [ { 'productName': {$regex: ?0, options: 'i' }, { 'productDescription': { $regex: ?0, $options: 'i'}} ] }")
	Mono<Long> countByKeyword(String keyword);

	@Query("{}")
	Flux<Product> findProductsPaged(PageRequest pageRequest);

	Flux<Product> findByRecipeId(String recipeId);
}
