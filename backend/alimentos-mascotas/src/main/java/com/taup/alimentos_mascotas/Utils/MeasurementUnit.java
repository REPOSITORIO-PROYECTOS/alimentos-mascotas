package com.taup.alimentos_mascotas.Utils;

public enum MeasurementUnit {
	GRAM("g"),
	KILOGRAM("kg"),
	MILLILITER("ml"),
	LITER("l"),
	UNIT("unidad");

	private final String symbol;

	MeasurementUnit(String symbol) {
		this.symbol = symbol;
	}

	public String getSymbol() {
		return symbol;
	}
}
