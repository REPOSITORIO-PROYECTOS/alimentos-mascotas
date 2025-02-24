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
	String id;

	@Size(min=3, max=100)
	String recipeName;

	@Size(max=100)
	String recipeDescription;

	Set<String> createdProducts;

	Map<String, Number> ingredientsWithQuantity;

	@Positive
	Integer stimatedPrepTime;

	@Positive
	Number stimatedServings;

	@Size(max = 200)
	String instructions;
}

