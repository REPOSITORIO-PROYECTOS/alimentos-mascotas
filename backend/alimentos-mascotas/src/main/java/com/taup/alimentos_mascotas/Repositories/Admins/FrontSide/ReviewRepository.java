package com.taup.alimentos_mascotas.Repositories.Admins.FrontSide;

import com.taup.alimentos_mascotas.Models.Admins.FrontSide.Review;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.repository.CountQuery;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface ReviewRepository extends ReactiveMongoRepository<Review, String> {
	@Query("{}")
	Flux<Review> findReviewsPaged(PageRequest pageRequest);

	@Query("{$or: [ { 'productId': {$regex: ?0, options: 'i' } ] }")
	Flux<Review> findReviewsByProductId(PageRequest pageRequest, String productId);

	@CountQuery(value = "{$or: [ { 'productId': {$regex: ?0, options: 'i' } ] }")
	Mono<Long> countByProductId(String productId);

	@Query("{ 'productId': ?0, 'stars': { $gte: ?1 }, 'isAuth': true }")
	Flux<Review> findByProductIdAndStarsGreaterThanEqualAndIsAuthTrueOrderByStarsDesc(String productId, int stars);
}
