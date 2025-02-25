package com.taup.alimentos_mascotas.DTO;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class InvoiceWithProviderDTO {
	// Datos de la Factura
	private String invoiceId;
	private String invoiceDescription;
	private Double invoiceDueAmount;
	private Double invoicePaidAmount;
	private LocalDate invoicePaymentDueDate;
	private LocalDateTime InvoiceLastPaymentDate;

	// Datos del proveedor
	private String providerId;
	private String providerName;
	private String providerCuitCuil;
	private String providerAddress;
	private String providerPhone;

}