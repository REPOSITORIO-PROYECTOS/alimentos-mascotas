package com.taup.alimentos_mascotas.Models.Admins.Finance;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.taup.alimentos_mascotas.Models.ModelClass;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class Invoice extends ModelClass {
	@Id
	private String id;

	@Size(min = 3, max = 150, message = "La descripción debe tener entre 3 y 150 caracteres.")
	private String description;

	@Min(value = 0, message = "El valor del pago debe ser 0 o mayor.")
	private Double dueAmount;

	@Min(value = 0, message = "El valor pagado debe ser 0 o mayor.")
	@Positive
	private Double paidAmount;

	private Boolean hasDebt;

	private Boolean isPaid;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
	private LocalDate paymentDueDate;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy'T'HH:mm")
	private LocalDateTime lastPaymentDate;

	private String providerId;
}