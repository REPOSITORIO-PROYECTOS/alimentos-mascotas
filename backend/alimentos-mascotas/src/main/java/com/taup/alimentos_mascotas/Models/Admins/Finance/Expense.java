package com.taup.alimentos_mascotas.Models.Admins.Finance;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Document(collection = "expenses")
public class Expense {
	@Id
	String id;

	@Positive
	@DecimalMin("0.0")
	BigDecimal amount;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy'T'HH:mm")
	private LocalDateTime  expenseDate;

	String expenseType;

	String details;
}
