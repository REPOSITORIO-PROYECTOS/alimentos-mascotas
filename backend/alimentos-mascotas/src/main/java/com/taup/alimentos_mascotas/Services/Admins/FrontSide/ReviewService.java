package com.taup.alimentos_mascotas.Services.Admins.FrontSide;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Exceptions.MonoEx;
import com.taup.alimentos_mascotas.Models.Admins.FrontSide.Review;
import com.taup.alimentos_mascotas.Repositories.Admins.FrontSide.ReviewRepository;
import com.taup.alimentos_mascotas.Repositories.Admins.Management.ProductRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class ReviewService {

	private final ReviewRepository reviewRepo;
	private final ProductRepository productRepo;

	@Transactional(readOnly = true)
	public Mono<PagedResponse<Review>> listAllPaged(int page, int size, String keyword) {
		PageRequest pageRequest = PageRequest.of(page, size);

		if (keyword != null && !keyword.isEmpty()) {
			return getReviewsByProductId(pageRequest, keyword);
		}

		return getAllReviesPaged(pageRequest);
	}

	@Transactional(readOnly = true)
	public Flux<Review> getBestReviewsForProduct(String productId) {
		return reviewRepo.findByProductIdAndStarsGreaterThanEqualAndIsAuthTrueOrderByStarsDesc(productId, 4)
				.take(3);
	}

	@Transactional
	public Mono<Review> save(Review review, String username){
		if (review.getId() != null) {
			return MonoEx.monoError(HttpStatus.BAD_REQUEST, "El ingrediente ya tiene ID, no puede almacenarse como nuevo");
		}

		review.setCreatedAt(LocalDateTime.now());
		review.setCreatedBy(username);
		review.setIsAuth(false);

		return reviewRepo.save(review);
	}

	@Transactional
	public Mono<Review> update(Review review, String reviewId, String username) {
		if (!review.getId().equals(reviewId)) {
			return MonoEx.monoError(HttpStatus.BAD_REQUEST, "Los IDs de las reseñas a actualizar no coinciden.");
		}

		return reviewRepo.findById(reviewId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encontró la reseña con ID: " + reviewId))
				.flatMap(existingReview -> {
					Review updatedReview = mappingReviewToUpdate(existingReview, review, username);
					return reviewRepo.save(updatedReview);
				});
	}

	@Transactional
	public Mono<Review> authorizeReview(String reviewId){
		return reviewRepo.findById(reviewId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.BAD_REQUEST, "La reseña con ID: "+reviewId+", no existe"))
				.flatMap(review -> {
					review.setIsAuth(true);
					return reviewRepo.save(review);
				});
	}

	@Transactional
	public Mono<Void> delete(String reviewId){
		return reviewRepo.findById(reviewId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encotro la reseña a a eliminar."))
				.flatMap(reviewToDelete ->{
					return productRepo.findById(reviewToDelete.getProductId())
							.flatMap(product -> {
								product.getReviewsIds().remove(reviewId);
								return productRepo.save(product);
							});
				})
				.then(reviewRepo.deleteById(reviewId));
	}

	private Review mappingReviewToUpdate(Review existingReview, Review review, String username) {

		existingReview.setTextReview(review.getTextReview());
		existingReview.setUpdatedAt(LocalDateTime.now());
		existingReview.setModifiedBy(username);
		existingReview.setStars(review.getStars());

		return  existingReview;
	}

	private Mono<PagedResponse<Review>> getAllReviesPaged(PageRequest pageRequest) {
		Mono<Long> totalElements = reviewRepo.count();
		Flux<Review> reviewFlux = reviewRepo.findReviewsPaged(pageRequest);

		return Mono.zip(totalElements, reviewFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(),
						pageRequest.getPageNumber(),
						pageRequest.getPageSize()
				));
	}

	private Mono<PagedResponse<Review>> getReviewsByProductId(PageRequest pageRequest, String productId) {
		Mono<Long> totalElements = reviewRepo.countByProductId(productId);
		Flux<Review> reviewFlux = reviewRepo.findReviewsByProductId(pageRequest, productId);

		return Mono.zip(totalElements, reviewFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(),
						pageRequest.getPageNumber(),
						pageRequest.getPageSize()
				));
	}
}
