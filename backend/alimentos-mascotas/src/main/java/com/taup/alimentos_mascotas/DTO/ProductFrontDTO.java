package com.taup.alimentos_mascotas.DTO;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Set;

@Data
public class ProductFrontDTO {
	private String id;
	private String productName;
	private String productDescription;
	private String productDetails;
	private String imageUrl;
	private BigDecimal sellingPrice;
	private BigDecimal discountPercent;
	private Set<String> categories;
}
