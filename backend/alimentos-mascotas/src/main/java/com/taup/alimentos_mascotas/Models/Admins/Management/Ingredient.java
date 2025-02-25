package com.taup.alimentos_mascotas.Models.Admins.Management;

import com.taup.alimentos_mascotas.Models.ModelClass;
import com.taup.alimentos_mascotas.Utils.MeasurementUnit;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Set;

@Data
@Document(collection = "ingredients")
public class Ingredient extends ModelClass {
	@Id
	String id;

	@Size(min =3, max =75)
	String ingredientName;

	@Size(max = 100)
	String ingredientDescription;

	Set<String> providerId;

	@Valid
	MeasurementUnit measurementUnit;
}
