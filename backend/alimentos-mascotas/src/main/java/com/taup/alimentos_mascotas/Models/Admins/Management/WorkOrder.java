package com.taup.alimentos_mascotas.Models.Admins.Management;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.taup.alimentos_mascotas.Models.ModelClass;
import com.taup.alimentos_mascotas.Utils.OrderStatus;
import com.taup.alimentos_mascotas.Utils.Priority;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Document(collection = "work_orders")
public class WorkOrder extends ModelClass {
	@Id
	private String id;

	@NotBlank
	private String productId;

	@NotBlank
	private String recipeId;

	@Positive
	private Number quantityToDo;

	@NotBlank
	@Positive
	private Map<String, Number> estimatedIngredients;

	@Valid
	private Priority priority;

	@Valid
	private OrderStatus status;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy'T'HH:mm:ss")
	@PastOrPresent
	private LocalDateTime completedAt;

	@Size(max = 150)
	private String notes;

	@Positive
	@DecimalMin("0.0")
	private BigDecimal estimatedCost;


	@NotBlank
	@Positive
	private Map<String, Number> usedIngredients;

	private Map<String, Number> ingredientDifferences;

	@Positive
	@DecimalMin("0.0")
	private BigDecimal realCost;

	@Positive
	private Number completedQuantity;
}


