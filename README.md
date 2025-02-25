# alimentos-mascotas

Proyecto de sistema de gestion de la fábrica de alimentos y snacks para mascotas "Barker".
Este proyecto permite administrar inventarios, pedidos, proveedores, ventas. Las ventas se manejaran desde el la tienda virtual o directamente desde el servicio de Caja del dasboard
Se implementarám métodos de pago virtuales.

## Modalidad de Trabajo

- **Estándares de código**:

### Backend

- **Tecnologías**: Spring WebFlux, Spring Security, Java 17.
- **Manejo de errores**: Todos los controladores deben incluir manejo de errores adecuado(1).
- **Despliegue**: Versión de prueba en Render una vez finalizado el CRUD básico de cada clase.
- **Documentación**: La API se documentará con Swagger(2).
- **Estilo de declaracion de endpoints:**

```java
  @RequestMapping("/api/facturas")
  @GetMapping("/detalles/{invoiceId}")
```

### Frontend

- **Tecnologías**: Next.js, Tailwind CSS, shadcn, TanStack, react-hook-form, Zod.

## Cómo Contribuir

- **Flujo de trabajo**:

1. **Clona el repositorio**
2. **Crea una rama**: Se debe crear rama a pardtir de la rama **Dev** y no directamente en la rama **main**.
3. **Realiza tus cambios**: Haz las modificaciones necesarias.
4. **Notificar cambios al equipo**: Describe los cambios realizados en el mensaje del commit, solicita una revisión si es necesario y notifica al equipo de los cambios realizados.

## Estilos y Convenciones

Describe los estilos y convenciones que se siguen en el proyecto:

- **Formato**: Las variables deben tener nombres descriptivos, ya sea en ingles y/o español.

```java
  int cantidadProductos; // Correcto
  int qty; // Evitar
```

- **Comentarios**: Si se comenta un bloque de codigo, agregar descripcion de porque se comentó(Errores que produjo, se mejoró u optimizó el codigo, etc.). Dicho bloque comentado debe quedar al final o inicio de el archivo.
  **Ejemplo:**

```javascript
// Este bloque se comentó porque causaba un error de concurrencia. Se optimizó en la versión 2.0.
// código comentado...
```

## Ejemplos de Código

### Ejemplo de manejo de errores reactivos con Webflux(1):

```java
//CONTROLADOR
	@GetMapping("/detalles/{invoiceId}")
	public Mono<ResponseEntity<InvoiceWithProviderDTO>> getInvoiceWithDetails(
			@Parameter(description = "ID de la factura a buscar", required = true, example = "12345") @PathVariable String invoiceId) {
		return invoiceService.getInvoiceWithDetails(invoiceId)
				.map(ResponseEntity::ok)
				.switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Factura no encontrada")));
	}
//SERVICIO
	public Mono<InvoiceWithProviderDTO> getInvoiceWithDetails(String invoiceId) {
		return invoiceRepo.findById(invoiceId)
				.switchIfEmpty(Mono
						.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró la factura con ID" + invoiceId)))
				.flatMap(invoice -> providerRepo.findById(invoice.getProviderId())
						.switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
								"No se encontró proveedor con el ID: " + invoice.getProviderId())))
						.flatMap(provider -> mappingFromInvoiceToInvoiceWithProviderDTO(invoice, provider)));
	}
```

### Ejemplo de documentacion con Swagger(2):

```java
  @RestController

  @Tag(name = "Invoice Controller", description = "Endpoints para la gestión de facturas")
  @CrossOrigin(origins = "*")
  @RequiredArgsConstructor
  public class InvoiceController {
    @Operation(summary = "Obtener facturas paginadas", description = "Retorna una lista paginada de facturas. Se pueden especificar el número de página y el tamaño de la página.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Facturas obtenidas exitosamente"),
        @ApiResponse(responseCode = "400", description = "Parámetros de paginación inválidos")
    })
    @GetMapping("/paged")
    public Mono<PagedResponse<Invoice>> getInvoicesPaged(
        @Parameter(description = "Número de página (por defecto 0)", example = "0") @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Tamaño de la página (por defecto 10)", example = "10") @RequestParam(defaultValue = "10") int size) {
      return invoiceService.getInvoicesPaged(page, size);
    }
  }
```
