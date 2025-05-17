package com.taup.alimentos_mascotas.Models.Admins.FrontSide;

import com.taup.alimentos_mascotas.Models.ModelClass;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.Id;

public class Category extends ModelClass {
	@Id
	private String id;

	@NotEmpty
	@Size(max = 20)
	private String categoryName;

}
