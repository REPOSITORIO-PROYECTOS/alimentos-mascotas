package com.taup.alimentos_mascotas.Controllers.Admins.Finance;

import com.taup.alimentos_mascotas.DTO.CashMovementRequestDTO;
import com.taup.alimentos_mascotas.Models.Admins.Finance.CashMovement;
import com.taup.alimentos_mascotas.Models.Admins.Finance.CashRegister;
import com.taup.alimentos_mascotas.Services.Admins.Finance.CashRegisterService;
import com.taup.alimentos_mascotas.Utils.MonthlyBalance;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/caja")
@Tag(name = "Cash Register Controller", description = "Endpoints para gestionar las caja")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CashRegisterController {

	private final CashRegisterService cashRegisterService;

	@Operation(summary = "Abrir, cerrar o consultar estado de una caja", description = "Crea, cierra o consulta una nueva caja. Los valores para el parametro 'operacion' son: 'abrir', 'cerrar' o 'consultar'.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Apertura o cierre de caja correctamente"),
			@ApiResponse(responseCode = "400", description = "Ya existe una caja abierta o error al abrirla o no hay una abierta para cerrar"),
			@ApiResponse(responseCode = "404", description = "No hay caja abierta")
	})
	@PostMapping("/estado")
	public Mono<ResponseEntity<CashRegister>> status(Authentication auth, @RequestParam String operacion) {
		if(operacion.equals("abrir")){
			return cashRegisterService.openCashRegister(auth.getName())
					.map(ResponseEntity::ok);
		}
		else if(operacion.equals("cerrar")){
			return cashRegisterService.closeCashRegister(auth.getName())
					.map(ResponseEntity::ok);
		}
		else if(operacion.equals("consultar")){
			return cashRegisterService.getOpenCashRegister()
					.map(ResponseEntity::ok)
					.switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "No hay caja abierta.")));
		}
		else{
			return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Operación no reconocida o no se ha especificado."));
		}
	}

	@GetMapping("/balance-mensual")
	@Operation(summary = "Obtener balance mensual de la caja", description = "Devuelve el balance mensual con todos los cierres de caja realizados durante el mes especificado, incluyendo ingresos y egresos diarios, y un balance total.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Balance mensual obtenido exitosamente"),
			@ApiResponse(responseCode = "400", description = "Parámetros inválidos (año o mes fuera de rango)"),
			@ApiResponse(responseCode = "404", description = "No se encontraron cierres de caja para el mes especificado"),
			@ApiResponse(responseCode = "500", description = "Error interno del servidor")
	})
	public Mono<MonthlyBalance> getMonthlyBalance(
			@Parameter(description = "Año del balance, debe ser menor o igual al año actual", example = "2024") @RequestParam int year,
			@Parameter(description = "Mes del balance, debe estar entre 1 y 12 y no puede ser posterior al mes actual", example = "1") @RequestParam int month) {

		if (year < 0 || month < 1 || month > 12) {
			return Mono.error(
					new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parámetros inválidos (año o mes fuera de rango)"));
		}
		return cashRegisterService.getMonthlyBalance(year, month)
				.switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
						"No se encontraron cierres de caja para el mes especificado")));
	}

	@PostMapping("/registrar-movimiento")
	@Operation(summary = "Registrar movimiento en caja", description = "Registra un ingreso o egreso manual en la caja abierta.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "Movimiento registrado correctamente"),
		@ApiResponse(responseCode = "400", description = "Caja no abierta o datos inválidos")
	})
	public Mono<ResponseEntity<CashMovement>> registrarMovimiento(
			Authentication auth,
			@RequestBody CashMovementRequestDTO request) {
		return cashRegisterService.registerCashMovement(auth.getName(), request)
				.thenReturn(ResponseEntity.ok().build());
	}

	@GetMapping("/items")
	public Flux<CashMovement> getItems(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(defaultValue = "") String keyword,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

		LocalDateTime fromDateTime = from.atStartOfDay();
		LocalDateTime toDateTime = to.atTime(LocalTime.MAX);

		return cashRegisterService.getItems(page, size, keyword, fromDateTime, toDateTime);
	}
}