package com.taup.alimentos_mascotas.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.http.codec.multipart.FilePart;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ProductDTO {
	private String id;

	@Size(min = 3, max = 100)
	private String productName;

	@Size(min = 5, max = 150)
	private String productDescription;

	@Size(min = 5, max = 500)
	private String productDetails;

	private FilePart image;

	@Positive
	private BigDecimal sellingPrice;

	private BigDecimal discountPercent;

	private Set<String> reviewsIds;

	private Set<String> categories;

	@Positive
	private BigDecimal costPrice;

	@Indexed(unique = true)
	private String productCode;

	private String recipeId;

	@Positive
	private Number stock;

     @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy'T'HH:mm")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy'T'HH:mm")
    private LocalDateTime updatedAt;

    private String modifiedBy;

    private String createdBy;
}
