package com.taup.alimentos_mascotas.DTO;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CartItemDTO {
	private String id;
	private String title;
	private String description;
	private String pictureUrl;
	private String categoryId;
	private int quantity;
	private String currencyId;
	private BigDecimal unitPrice;
}
