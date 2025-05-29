package com.taup.alimentos_mascotas.Models.Admins.Management;

import com.taup.alimentos_mascotas.Models.ModelClass;
import com.taup.alimentos_mascotas.Utils.MeasurementUnit;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.Set;

@Data
@Document(collection = "ingredients")
public class Ingredient extends ModelClass {
	@Id
	private String id;

	@Positive
	private BigDecimal price;

	@Size(min =3, max =75)
	private String ingredientName;

	@Size(max = 100)
	private String ingredientDescription;

	private Set<String> providerId;

	@Positive
	private Number stock;

	private MeasurementUnit measurementUnit;
}
