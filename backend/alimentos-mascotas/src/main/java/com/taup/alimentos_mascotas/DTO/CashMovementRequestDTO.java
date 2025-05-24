package com.taup.alimentos_mascotas.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CashMovementRequestDTO {
	private String PaymentId;
	private String title;
	private String description;
	private double amount;
	private boolean isIncome;
}
