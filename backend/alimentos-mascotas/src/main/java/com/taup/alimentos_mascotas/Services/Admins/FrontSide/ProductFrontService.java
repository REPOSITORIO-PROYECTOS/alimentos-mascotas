package com.taup.alimentos_mascotas.Services.Admins.FrontSide;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.DTO.ProductFrontDTO;
import com.taup.alimentos_mascotas.Exceptions.MonoEx;
import com.taup.alimentos_mascotas.Models.Admins.Management.Product;
import com.taup.alimentos_mascotas.Repositories.Admins.Management.ProductRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@AllArgsConstructor
public class ProductFrontService {

	private final ProductRepository productRepo;

	@Transactional(readOnly = true)
	public Mono<PagedResponse<ProductFrontDTO>> listAllPaged(int page, int size, String keyword) {
		PageRequest pageRequest = PageRequest.of(page, size);

		if(keyword != null && !keyword.isEmpty()){
			return getProductsByKeyword(pageRequest, keyword);
		}

		return getAllProductsPaged(pageRequest);
	}

	@Transactional(readOnly = true)
	public Mono<ProductFrontDTO> getProduct(String productId){
		return productRepo.findById(productId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.BAD_REQUEST, "No se encontró el producto"))
				.map(product -> mapProductToProductDTO(product, new ProductFrontDTO()));
	}


	private Mono<PagedResponse<ProductFrontDTO>> getAllProductsPaged(PageRequest pageRequest) {
		Mono<Long> totalElements = productRepo.count();
		Flux<ProductFrontDTO> productsFlux = productRepo.findProductsPaged(pageRequest)
				.map(product -> mapProductToProductDTO(product, new ProductFrontDTO()));

		return Mono.zip(totalElements, productsFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(),
						pageRequest.getPageNumber(),
						pageRequest.getPageSize()
				));
	}

	private Mono<PagedResponse<ProductFrontDTO>> getProductsByKeyword(PageRequest pageRequest, String keyword) {
		Mono<Long> totalElements = productRepo.countByKeyword(keyword);
		Flux<ProductFrontDTO> productsFlux= productRepo.findByKeyword(keyword, pageRequest)
				.map(product -> mapProductToProductDTO(product, new ProductFrontDTO()));

		return Mono.zip(totalElements, productsFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(),
						pageRequest.getPageNumber(),
						pageRequest.getPageSize()
				));
	}


	private ProductFrontDTO mapProductToProductDTO(Product product, ProductFrontDTO productDTO){
		productDTO.setId(product.getId());
		productDTO.setProductName(product.getProductName());
		productDTO.setProductDescription(product.getProductDescription());
		productDTO.setProductDetails(product.getProductDetails());
		productDTO.setImageUrl(product.getImageUrl());
		productDTO.setSellingPrice(product.getSellingPrice());
		productDTO.setDiscountPercent(product.getDiscountPercent());

		return  productDTO;
	}
}
