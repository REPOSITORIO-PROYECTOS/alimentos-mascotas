package com.taup.alimentos_mascotas.Models.Admins.Management;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.taup.alimentos_mascotas.Models.ModelClass;
import com.taup.alimentos_mascotas.Utils.OrderStatus;
import com.taup.alimentos_mascotas.Utils.PaymentMethod;
import com.taup.alimentos_mascotas.Utils.Priority;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Document(collection = "purchase_orders")
public class PurchaseOrder extends ModelClass {
	@Id
	private String id;

	@NotBlank
	private String supplierId;

	@NotBlank
	private String supplierName;

	@NotBlank
	private Map<String, Number> ingredients;

	@Positive
	private BigDecimal totalAmount;

	private Boolean isPaid;

	@Valid
	private PaymentMethod paymentMethod;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy'T'HH:mm:ss")
	private LocalDateTime orderDate;

	@Valid
	private OrderStatus status;

	@Size(max = 200)
	private String notes;

	@Valid
	private Priority priority;

	@NotNull
	private Boolean isAuthorized;

	private String authorizedBy;
}

