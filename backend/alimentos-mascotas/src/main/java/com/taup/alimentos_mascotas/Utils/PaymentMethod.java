package com.taup.alimentos_mascotas.Utils;

public enum PaymentMethod {
	CASH("Efectivo"),
	CREDIT_CARD("Tarjeta de Crédito"),
	DEBIT_CARD("Tarjeta Débito"),
	BANK_TRANSFER("Transferencia Bancaria"),
	MERCADOPAGO("Mercadopago"),
	PAYPAL("PayPal"),
	APPLE_PAY("Apple Pay"),
	GOOGLE_PAY("Google Pay"),
	CRYPTOCURRENCY("Criptomonedas"),
	CHECK("Cheque"),
	GIFT_CARD("Tarjeta de Regalo"),
	BANK_PAYMENT("Pago Bancario");

	private final String description;

	PaymentMethod(String description) {
		this.description = description;
	}

	public String getDescription() {
		return description;
	}
}
