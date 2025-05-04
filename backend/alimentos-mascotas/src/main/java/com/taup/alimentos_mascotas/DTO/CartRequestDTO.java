package com.taup.alimentos_mascotas.DTO;

import lombok.Data;

import java.util.List;

@Data
public class CartRequestDTO {
	private String externalReference;
	private List<CartItemDTO> items;
}
