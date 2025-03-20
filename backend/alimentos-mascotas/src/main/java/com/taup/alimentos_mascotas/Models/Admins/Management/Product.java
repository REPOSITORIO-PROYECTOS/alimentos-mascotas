package com.taup.alimentos_mascotas.Models.Admins.Management;

import com.taup.alimentos_mascotas.Models.ModelClass;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.Set;

@Data
@Document(collection = "products")
public class Product extends ModelClass {
	@Id
	private String id;

	@Size(min = 3, max = 100)
	private String productName;

	@Size(min = 5, max = 150)
	private String productDescription;

	@Size(min = 5, max = 500)
	private String productDetails;

	@NotBlank
	private String imageUrl;

	@Positive
	private BigDecimal sellingPrice;

	private BigDecimal discountPercent;

	private Set<String> reviewsIds;

	private Set<String> categories;

	// ? Atributos de administracion

	@Positive
	private BigDecimal costPrice;

	@Indexed(unique = true)
	private String productCode;

	private String recipeId;

	@Positive
	private Number stock;

}
