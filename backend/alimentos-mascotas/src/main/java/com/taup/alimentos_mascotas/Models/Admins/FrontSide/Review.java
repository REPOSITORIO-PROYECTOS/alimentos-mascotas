package com.taup.alimentos_mascotas.Models.Admins.FrontSide;

import com.taup.alimentos_mascotas.Models.ModelClass;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "reviews")
public class Review extends ModelClass {
	@Id
	private String id;

	@NotBlank
	private String productId;

	@NotEmpty
	@Size(min = 15, max = 200)
	private String textReview;

	@Positive
	@Min(value = 1)
	private Integer stars;

	private Boolean isAuth;
}
