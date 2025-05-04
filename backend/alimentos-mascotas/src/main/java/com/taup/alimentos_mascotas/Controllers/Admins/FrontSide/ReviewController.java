package com.taup.alimentos_mascotas.Controllers.Admins.FrontSide;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Models.Admins.FrontSide.Review;
import com.taup.alimentos_mascotas.Services.Admins.FrontSide.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/resenas")
@RequiredArgsConstructor
public class ReviewController {

	private final ReviewService reviewService;

	@GetMapping("/pagina")
	public Mono<PagedResponse<Review>> listAllPaged(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false) String keyword) {
		return reviewService.listAllPaged(page, size, keyword);
	}

	@GetMapping("/mejores/{productId}")
	public Flux<Review> getBestReviewsForProduct(@PathVariable String productId) {
		return reviewService.getBestReviewsForProduct(productId);
	}

	@PostMapping
	public Mono<Review> save(@RequestBody Review review) {
		String username = "ADMIN"; // Obtener el nombre de usuario autenticado
		return reviewService.save(review, username);
	}

	@PutMapping("/{reviewId}")
	public Mono<Review> update(
			@PathVariable String reviewId,
			@RequestBody Review review) {
		String username = "ADMIN"; // Obtener el nombre de usuario autenticado
		return reviewService.update(review, reviewId, username);
	}

	@PutMapping("/autorizar/{reviewId}")
	public Mono<Review> authorizeReview(@PathVariable String reviewId) {
		return reviewService.authorizeReview(reviewId);
	}

	@DeleteMapping("/{reviewId}")
	public Mono<Void> delete(@PathVariable String reviewId) {
		return reviewService.delete(reviewId);
	}
}
