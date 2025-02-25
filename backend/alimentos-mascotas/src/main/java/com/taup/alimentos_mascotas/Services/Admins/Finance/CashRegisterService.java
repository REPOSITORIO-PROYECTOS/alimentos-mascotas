package com.taup.alimentos_mascotas.Services.Admins.Finance;


import com.taup.alimentos_mascotas.Models.Admins.Finance.CashRegister;
import com.taup.alimentos_mascotas.Repositories.Admins.Finance.CashRegisterRepository;
import com.taup.alimentos_mascotas.Repositories.Admins.Finance.InvoiceRepository;
import com.taup.alimentos_mascotas.Repositories.Admins.Finance.PaymentRepository;
import com.taup.alimentos_mascotas.Services.Profiles.UserService;
import com.taup.alimentos_mascotas.Utils.MonthlyBalance;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CashRegisterService {
	private final CashRegisterRepository cashRegisterRepo;
	private final PaymentRepository paymentRepo;
	private final InvoiceRepository invoiceRepo;
	private final UserService userService;

	public Mono<CashRegister> openCashRegister(String username) {
		return userService.getFullName(username)
				.flatMap(name ->{
					return cashRegisterRepo.findFirstByIsClosedFalse()
							.hasElement() // Verifica si hay elementos
							.flatMap(hasOpenRegister -> {
								if (hasOpenRegister) {
									return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
											"Ya existe una caja abierta. Cierre la caja actual antes de abrir una nueva."));
								}
								// Crear una nueva caja si no hay una abierta
								CashRegister newCashRegister = new CashRegister();
								newCashRegister.setStartDate(LocalDateTime.now());
								newCashRegister.setIsClosed(false);
								newCashRegister.setCreatedBy(name);
								return cashRegisterRepo.save(newCashRegister);
							});
				});

	}

	public Mono<CashRegister> closeCashRegister(String username) {
		return userService.getFullName(username)
				.flatMap(name -> {
					return cashRegisterRepo.findFirstByIsClosedFalse()
							.switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
									"No existe una caja abierta para cerrar.")))
							.flatMap(cashRegister -> {
								// Calcular ingresos
								Mono<BigDecimal> totalIncomeMono = paymentRepo.findAll()
										.filter(payment -> payment.getLastPaymentDate() != null)
										.filter(payment -> payment.getLastPaymentDate()
												.isAfter(cashRegister.getStartDate()))
										.filter(payment -> payment.getLastPaymentDate()
												.isBefore(LocalDateTime.now()))
										.reduce(BigDecimal.ZERO,
												(total, payment) -> total.add(BigDecimal
														.valueOf(payment.getPaidAmount())));

								// Calcular egresos
								Mono<BigDecimal> totalExpenseMono = invoiceRepo.findAll()
										.filter(invoice -> invoice.getLastPaymentDate() != null)
										.filter(invoice -> invoice.getLastPaymentDate()
												.isAfter(cashRegister.getStartDate()))
										.filter(invoice -> invoice.getLastPaymentDate()
												.isBefore(LocalDateTime.now()))
										.reduce(BigDecimal.ZERO,
												(total, invoice) -> total.add(BigDecimal
														.valueOf(invoice.getPaidAmount())));

								return Mono.zip(totalIncomeMono, totalExpenseMono)
										.flatMap(tuple -> {
											BigDecimal totalIncome = tuple.getT1();
											BigDecimal totalExpense = tuple.getT2();

											cashRegister.setEndDate(LocalDateTime.now());
											cashRegister.setTotalIncome(totalIncome);
											cashRegister.setTotalExpense(totalExpense);
											cashRegister.setIsClosed(true);
											cashRegister.setClosedBy(username);

											return cashRegisterRepo.save(cashRegister);
										});
							});
				});

	}

	public Mono<MonthlyBalance> getMonthlyBalance(int year, int month) {
		LocalDate currentDate = LocalDate.now();
		if (year < 1900 || year > LocalDate.now().getYear() + 1) {
			return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"El año proporcionado no es válido."));
		}
		if (month < 1 || month > 12) {
			return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"El mes proporcionado no es válido. Debe estar entre 1 y 12."));
		}
		if (year > currentDate.getYear()
				|| (year == currentDate.getYear() && month > currentDate.getMonthValue())) {
			return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"El mes proporcionado no puede ser posterior al mes actual."));
		}

		LocalDateTime startOfMonth = LocalDateTime.of(year, month, 1, 0, 0);
		LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusSeconds(1);

		return cashRegisterRepo.findAll()
				.filter(cashRegister -> cashRegister.getEndDate() != null)
				.filter(cashRegister -> !cashRegister.getEndDate().isBefore(startOfMonth)
						&& !cashRegister.getEndDate().isAfter(endOfMonth))
				.collectList()
				.flatMap(cashRegisters -> {
					if (cashRegisters.isEmpty()) {
						return Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
								"No se encontraron cierres de caja para el mes especificado."));
					}

					BigDecimal totalIncome = BigDecimal.ZERO;
					BigDecimal totalExpense = BigDecimal.ZERO;

					for (CashRegister cashRegister : cashRegisters) {
						totalIncome = totalIncome.add(cashRegister.getTotalIncome());
						totalExpense = totalExpense.add(cashRegister.getTotalExpense());
					}

					return Mono.just(new MonthlyBalance(cashRegisters, totalIncome, totalExpense));
				});
	}

	public Mono<CashRegister> getOpenCashRegister() {
		return cashRegisterRepo.findFirstByIsClosedFalse()
				.switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
						"No hay una caja abierta actualmente.")))
				.flatMap(cashRegister -> {
					// Calcular ingresos
					cashRegister.getStartDate();
					System.out.println("caja: " + cashRegister.getStartDate());
					Mono<BigDecimal> totalIncomeMono = paymentRepo.findAll()
							.filter(payment -> payment.getLastPaymentDate() != null)
							.filter(payment -> payment.getLastPaymentDate()
									.isAfter(cashRegister.getStartDate()))
							.filter(payment -> payment.getLastPaymentDate()
									.isBefore(LocalDateTime.now()))
							.reduce(BigDecimal.ZERO,
									(total, payment) -> total.add(BigDecimal
											.valueOf(payment.getPaidAmount())));

					// Calcular egresos
					Mono<BigDecimal> totalExpenseMono = invoiceRepo.findAll()
							.filter(invoice -> invoice.getLastPaymentDate() != null)
							.filter(invoice -> invoice.getLastPaymentDate()
									.isAfter(cashRegister.getStartDate()))
							.filter(invoice -> invoice.getLastPaymentDate()
									.isBefore(LocalDateTime.now())) // de los
							// filtros
							.reduce(BigDecimal.ZERO,
									(total, invoice) -> total.add(BigDecimal
											.valueOf(invoice.getPaidAmount())));

					// Combinar ingresos y egresos para la vista provisional
					return Mono.zip(totalIncomeMono, totalExpenseMono)
							.map(tuple -> {
								BigDecimal totalIncome = tuple.getT1();
								BigDecimal totalExpense = tuple.getT2();

								System.out.println(totalExpense);
								System.out.println(totalIncome);

								CashRegister provisionalView = new CashRegister();
								provisionalView.setId(cashRegister.getId());
								provisionalView.setStartDate(
										cashRegister.getStartDate());
								provisionalView.setEndDate(LocalDateTime.now());
								provisionalView.setTotalIncome(totalIncome);
								provisionalView.setTotalExpense(totalExpense);
								provisionalView.setIsClosed(false); // Vista
								// provisional, NO
								// CIERRA LA CAJA
								provisionalView.setCreatedBy(
										cashRegister.getCreatedBy());
								provisionalView.setClosedBy("SIN CERRAR");
								return provisionalView;
							});
				});
	}

	public Mono<Void> deleteAllCashRegisters() {
		return cashRegisterRepo.deleteAll().then(Mono.empty());
	}

}