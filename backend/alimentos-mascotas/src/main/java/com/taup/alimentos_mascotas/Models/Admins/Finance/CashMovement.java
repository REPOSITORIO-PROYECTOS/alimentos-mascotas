package com.taup.alimentos_mascotas.Models.Admins.Finance;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CashMovement {
	@Id
	private String id;

	private String cashRegisterId;     // Caja a la que pertenece el movimiento
	private String title;
	private String concept;            // Ej: "Donación", "Gasto en limpieza", etc.
	private double amount;
	private boolean isIncome;          // true = ingreso, false = egreso
	private LocalDateTime date;
	private String registeredBy;
}
