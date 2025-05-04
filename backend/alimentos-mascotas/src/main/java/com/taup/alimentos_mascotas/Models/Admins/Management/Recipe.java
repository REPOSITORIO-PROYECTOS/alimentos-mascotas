package com.taup.alimentos_mascotas.Models.Admins.Management;

import com.taup.alimentos_mascotas.Models.ModelClass;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;
import java.util.Set;

@Data
@Document(collection = "recipes")
public class Recipe extends ModelClass {
	@Id
	private String id;

	@Size(min=3, max=100)
	private String recipeName;

	@Size(max=100)
	private String recipeDescription;

	private Set<String> createdProducts;

	private Map<String, Number> ingredientsWithQuantity;

	@Positive
	private Integer estimatedPrepTime;

	@Positive
	private Number estimatedServings;

	@Size(max = 200)
	private String instructions;
}

