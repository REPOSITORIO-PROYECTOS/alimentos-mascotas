package com.taup.alimentos_mascotas.Models.Admins.Management;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.taup.alimentos_mascotas.Models.ModelClass;
import com.taup.alimentos_mascotas.Utils.OrderStatus;
import com.taup.alimentos_mascotas.Utils.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.Map;
import java.time.LocalDateTime;

@Data
@Document(collection = "buy_orders")
public class BuyOrder extends ModelClass {
	@Id
	private String id;

	@Size(min = 3, max = 150)
	private String address;

	@Positive
	private BigDecimal totalAmount;

	private Boolean isPaid;

	private Map<String, Number> products;

	@Valid
	private PaymentMethod paymentMethod;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy'T'HH:mm:ss")
	private LocalDateTime orderDate;

	@Valid
	private OrderStatus status;

	private String shippingMethod;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy'T'HH:mm:ss")
	private LocalDateTime estimatedDeliveryDate;

	@Positive
	private BigDecimal discountAmount;

	private String couponCode;

	private String customerId;

	private String paymentReference;

	@Size
	private String customerNotes;
}

