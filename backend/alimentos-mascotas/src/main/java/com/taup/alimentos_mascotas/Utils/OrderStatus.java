package com.taup.alimentos_mascotas.Utils;

public enum OrderStatus {
	PENDING("Pendiente"),
	PROCESSING("En Proceso"),
	SHIPPED("Enviado"),
	DELIVERED("Entregado"),
	CANCELLED("Cancelada"),
	FAILED("Fallida"),
	COMPLETED("Completada");

	private final String description;

	OrderStatus(String description) {
		this.description = description;
	}

	public String getDescription() {
		return description;
	}
}

