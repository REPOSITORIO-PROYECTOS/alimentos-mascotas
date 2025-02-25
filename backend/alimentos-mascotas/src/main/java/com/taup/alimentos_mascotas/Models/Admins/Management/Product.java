package com.taup.alimentos_mascotas.Models.Admins.Management;

import com.taup.alimentos_mascotas.Models.ModelClass;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "products")
public class Product extends ModelClass {
	@Id
	String id;

	@Size(min = 3, max = 100)
	String productName;

	@Size(min = 3, max = 100)
	String productDescription;

	@Indexed(unique = true)
	String productCode;

	@NotBlank
	String recipeId;

	@Positive
	Number stock;
}
