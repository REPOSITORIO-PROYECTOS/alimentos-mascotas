package com.taup.alimentos_mascotas.Repositories.Admins.Finance;

import com.taup.alimentos_mascotas.Models.Admins.Finance.Payment;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

@Repository
public interface PaymentRepository extends ReactiveMongoRepository<Payment, String> {

	// Metodos de paginacion y listado general
	@Query("{}")
	Flux<Payment> findPaymentsPaged(PageRequest pageRequest);

	Flux<Payment> findAllByHasDebt(Boolean hasDebt, PageRequest pageRequest);

	// Metodos de busqueda por deuda
	@Query("{ 'hasDebt': true, 'paymentDueDate': { $gte: ?0, $lt: ?1 } }")
	Flux<Payment> findAllWithDebtInMonth(LocalDate startOfMonth, LocalDate endOfMonth, PageRequest pageRequest);

	// Metodos de busqueda por relacion (studentId)
	Flux<Payment> findAllByStudentId(String studentId, PageRequest pageRequest);

	// Metodos de busqueda por fecha
	@Query("{ 'paymentDueDate': { $gte: ?0, $lte: ?1 } }")
	Flux<Payment> findByPaymentDueDateBetween(LocalDate start, LocalDate end);

	// Metodos de conteo
	Mono<Long> countAllByHasDebt(Boolean hasDebt);

	@Query(value = "{ 'hasDebt': ?0 }", count = true)
	Mono<Long> countByHasDebt(Boolean hasDebt);

	@Query(value = "{ 'hasDebt': true, 'paymentDueDate': { $gte: ?0, $lt: ?1 } }", count = true)
	Mono<Long> countWithDebtInMonth(LocalDate startOfMonth, LocalDate endOfMonth);

	@Query(value = "{ 'studentId': ?0 }", count = true)
	Mono<Long> countByStudentId(String studentId);
}
