package com.taup.alimentos_mascotas.Services.Admins.Management;


import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Exceptions.MonoEx;
import com.taup.alimentos_mascotas.Models.Admins.Management.BuyOrder;
import com.taup.alimentos_mascotas.Models.Admins.Management.Product;
import com.taup.alimentos_mascotas.Models.Admins.Management.Recipe;
import com.taup.alimentos_mascotas.Models.Admins.Management.WorkOrder;
import com.taup.alimentos_mascotas.Repositories.Admins.Management.IngredientRepository;
import com.taup.alimentos_mascotas.Repositories.Admins.Management.ProductRepository;
import com.taup.alimentos_mascotas.Repositories.Admins.Management.RecipeRepository;
import com.taup.alimentos_mascotas.Repositories.Admins.Management.WorkOrderRepository;
import com.taup.alimentos_mascotas.Utils.OrderStatus;
import com.taup.alimentos_mascotas.Utils.Priority;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class WorkOrderService {

	private final WorkOrderRepository workOrderRepo;
	private final ProductRepository productRepo;
	private final RecipeRepository recipeRepo;
	private final IngredientRepository ingredientRepo;

	@Transactional(readOnly = true)
	public Mono<PagedResponse<WorkOrder>> listAllPaged(int page, int size, String keyword) {
		PageRequest pageRequest = PageRequest.of(page, size);

		if(keyword != null && !keyword.isEmpty()){
			return getWorkOrdersByKeyword(pageRequest, keyword);
		}

		return getAllWorkOrdersPaged(pageRequest);
	}


	@Transactional(readOnly = true)
	public Flux<WorkOrder> findAll (){
		return workOrderRepo.findAll();
	}

	@Transactional
	public Mono<WorkOrder> save(WorkOrder workOrder, String username) {
		if (workOrder.getId() != null) {
			return MonoEx.monoError(HttpStatus.BAD_REQUEST, "La orden de trabajo ya tiene ID, no puede almacenarse como nueva");
		}

		workOrder.setCreatedAt(LocalDateTime.now());
		workOrder.setCreatedBy(username);

		return productRepo.findById(workOrder.getProductId())
				.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "Producto no encontrado con ID: " + workOrder.getProductId()))
				.flatMap(product -> recipeRepo.findById(product.getRecipeId())
						.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "Receta no encontrada para el producto con ID: " + product.getId()))
						.flatMap(recipe -> {

							Map<String, Number> estimatedIngredients = calculateEstimatedIngredients(recipe, new BigDecimal(workOrder.getQuantityToDo().toString()));

							workOrder.setEstimatedIngredients(estimatedIngredients);

							return calculateEstimatedCost(estimatedIngredients)
									.flatMap(estimatedCost -> {
										workOrder.setEstimatedCost(estimatedCost);
										return workOrderRepo.save(workOrder);
									});
						}));
	}


	@Transactional
	public Mono<WorkOrder> update(WorkOrder workOrder, String workOrderId, String username) {
		if (!workOrder.getId().equals(workOrderId)) {
			return MonoEx.monoError(HttpStatus.BAD_REQUEST,
					"Los IDs de la orden de trabajo a actualizar no coinciden.");
		}

		return workOrderRepo.findById(workOrderId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encontró la orden de trabajo con ID: " + workOrderId))
				.flatMap(existingWorkOrder -> {
					WorkOrder updatedWorkOrder = mappingWorkOrderToUpdate(existingWorkOrder, workOrder, username);

					if (!updatedWorkOrder.getEstimatedIngredients().equals(existingWorkOrder.getEstimatedIngredients())) {
						return calculateEstimatedCost(updatedWorkOrder.getEstimatedIngredients())
								.flatMap(estimatedCost -> {
									updatedWorkOrder.setEstimatedCost(estimatedCost);
									return workOrderRepo.save(updatedWorkOrder);
								});
					} else {
						return workOrderRepo.save(updatedWorkOrder);
					}
				});
	}

	@Transactional
	public Mono<WorkOrder> completeWorkOrder(WorkOrder completedWorkOrder, LocalDateTime finishingDate, String workOrderId) {
		return workOrderRepo.findById(workOrderId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encontró la orden de trabajo con ID: " + completedWorkOrder.getId()))
				.flatMap(previousWorkOrder -> {
					// ! validar la orden
					if(!previousWorkOrder.getId().equals(workOrderId)){
						return MonoEx.monoError(HttpStatus.BAD_REQUEST, "Los id del objeto y la solicitud no coinciden");
					}
					if (previousWorkOrder.getStatus() == OrderStatus.COMPLETED) {
						return MonoEx.monoError(HttpStatus.BAD_REQUEST, "La orden de trabajo ya está completada.");
					}

					previousWorkOrder.setUsedIngredients(completedWorkOrder.getUsedIngredients());
					previousWorkOrder.setStatus(OrderStatus.COMPLETED);
					previousWorkOrder.setCompletedAt(finishingDate);
					previousWorkOrder.setCompletedQuantity(completedWorkOrder.getCompletedQuantity());

					return calculateRealCost(completedWorkOrder.getUsedIngredients())
							.flatMap(realCost -> {
								previousWorkOrder.setRealCost(realCost);

								Map<String, Number> ingredientDifferences = calculateIngredientDifferences(
										previousWorkOrder.getEstimatedIngredients(),
										completedWorkOrder.getUsedIngredients()
								);
								previousWorkOrder.setIngredientDifferences(ingredientDifferences);

								return workOrderRepo.save(previousWorkOrder);
							});
				});
	}


	@Transactional
	public Mono<Void> delete (String workOrderId){
		return workOrderRepo.deleteById(workOrderId);
	}

	@Transactional
	public Flux<WorkOrder> createWorkOrderFromBuyOrder(BuyOrder buyOrder) {
		return Flux.fromIterable(buyOrder.getProducts().keySet())
				.flatMap(this::findProductById)
				.filter(product -> hasInsufficientStock(product, buyOrder))
				.collectList()
				.flatMapMany(products -> createWorkOrdersForProducts(products, buyOrder));
	}

	// ? Metodos locales

	private Mono<Product> findProductById(String productId) {
		return productRepo.findById(productId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No hay producto con el ID: "+productId));
	}

	private boolean hasInsufficientStock(Product product, BuyOrder buyOrder) {
		Number stock = product.getStock();
		Number requestedQuantity = buyOrder.getProducts().get(product.getId());
		return stock != null && requestedQuantity != null &&
				stock.doubleValue() < requestedQuantity.doubleValue();
	}

	private Flux<WorkOrder> createWorkOrdersForProducts(List<Product> products, BuyOrder buyOrder) {
		return Flux.fromIterable(products)
				.flatMap(product-> createWorkOrderForProduct(product, buyOrder));
	}

	private Mono<WorkOrder> createWorkOrderForProduct(Product product, BuyOrder buyOrder) {
		WorkOrder workOrder = buildWorkOrder(product, buyOrder);
		return calculateWorkOrderDetails(workOrder, product)
				.flatMap(workOrderRepo::save);
	}

	private WorkOrder buildWorkOrder(Product product, BuyOrder buyOrder) {
		WorkOrder workOrder = new WorkOrder();
		workOrder.setProductId(product.getId());
		workOrder.setQuantityToDo(calculateQuantityToProduce(product, buyOrder));
		workOrder.setPriority(determinePriority(product, buyOrder));
		return workOrder;
	}

	private double calculateQuantityToProduce(Product product, BuyOrder buyOrder) {
		double requestedQuantity = buyOrder.getProducts().get(product.getId()).doubleValue();
		double actualStock = product.getStock().doubleValue();
		return requestedQuantity - actualStock;
	}

	private Priority determinePriority(Product product, BuyOrder buyOrder) {
		double requestedQuantity = buyOrder.getProducts().get(product.getId()).doubleValue();
		return (requestedQuantity > 100 || Boolean.TRUE.equals(buyOrder.getIsPaid()))
				? Priority.HIGH
				: Priority.LOW;
	}

	private Mono<WorkOrder> calculateWorkOrderDetails(WorkOrder workOrder, Product product) {
		return recipeRepo.findById(product.getRecipeId())
				.flatMap(recipe -> {
					Map<String, Number> estimatedIngredients = calculateEstimatedIngredients(recipe, parseBigDecimal(workOrder.getQuantityToDo()));

					workOrder.setEstimatedIngredients(estimatedIngredients);

					return calculateEstimatedCost(estimatedIngredients)
							.map(totalCost -> {
								workOrder.setEstimatedCost(totalCost);
								return workOrder;
							});
				});
	}

	private Map<String, Number> calculateEstimatedIngredients(Recipe recipe, BigDecimal quantityToProduce) {
		Map<String, Number> estimatedIngredients = new HashMap<>();

		BigDecimal servings =  parseBigDecimal(recipe.getEstimatedServings());

		for (Map.Entry<String, Number> entry : recipe.getIngredientsWithQuantity().entrySet()) {
			String ingredientId = entry.getKey();


			BigDecimal quantityForUnit = parseBigDecimal(entry.getValue());

			BigDecimal estimatedQuantity = quantityForUnit.multiply(quantityToProduce.divide(servings));

			estimatedIngredients.put(ingredientId, estimatedQuantity);
		}
		return estimatedIngredients;
	}

	private Mono<BigDecimal> calculateEstimatedCost(Map<String, Number> estimatedIngredients) {
		return Flux.fromIterable(estimatedIngredients.entrySet())
				.flatMap(entry -> {
					String ingredientId = entry.getKey();
					double estimatedQuantity = entry.getValue().doubleValue();
					return ingredientRepo.findById(ingredientId)
							.map(ingredient -> ingredient.getPrice().multiply(BigDecimal.valueOf(estimatedQuantity)));
				})
				.reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	private Mono<BigDecimal> calculateRealCost(Map<String, Number> usedIngredients) {
		return Flux.fromIterable(usedIngredients.entrySet())
				.flatMap(entry -> {
					String ingredientId = entry.getKey();
					double quantity = entry.getValue().doubleValue();
					return ingredientRepo.findById(ingredientId)
							.map(ingredient -> ingredient.getPrice().multiply(BigDecimal.valueOf(quantity)));
				})
				.reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	private Map<String, Number> calculateIngredientDifferences(
			Map<String, Number> estimatedIngredients,
			Map<String, Number> usedIngredients) {
		Map<String, Number> differences = new HashMap<>();

		for (Map.Entry<String, Number> entry : estimatedIngredients.entrySet()) {
			String ingredientId = entry.getKey();
			BigDecimal estimatedQuantity = parseBigDecimal(entry.getValue());
			BigDecimal usedQuantity = parseBigDecimal(usedIngredients.getOrDefault(ingredientId, 0));

			BigDecimal difference = usedQuantity.subtract(estimatedQuantity);
			differences.put(ingredientId, difference);
		}

		return differences;
	}

	private BigDecimal parseBigDecimal(Number entry){
		return new BigDecimal(entry.toString());
	}

	private WorkOrder mappingWorkOrderToUpdate(WorkOrder existingWorkOrder, WorkOrder workOrder, String username) {
		existingWorkOrder.setProductId(workOrder.getProductId());
		existingWorkOrder.setQuantityToDo(workOrder.getQuantityToDo());
		existingWorkOrder.setEstimatedIngredients(workOrder.getEstimatedIngredients());
		existingWorkOrder.setUsedIngredients(workOrder.getUsedIngredients());
		existingWorkOrder.setIngredientDifferences(workOrder.getIngredientDifferences());
		existingWorkOrder.setStatus(workOrder.getStatus());
		existingWorkOrder.setCompletedAt(workOrder.getCompletedAt());
		existingWorkOrder.setNotes(workOrder.getNotes());
		existingWorkOrder.setRealCost(workOrder.getRealCost());
		existingWorkOrder.setCompletedQuantity(workOrder.getCompletedQuantity());
		existingWorkOrder.setPriority(workOrder.getPriority());
		existingWorkOrder.setUpdatedAt(LocalDateTime.now());
		existingWorkOrder.setModifiedBy(username);

		return existingWorkOrder;
	}

	private Mono<PagedResponse<WorkOrder>> getWorkOrdersByKeyword(PageRequest pageRequest, String keyword) {
		Mono<Long> totalElements = workOrderRepo.countByKeyword(keyword);
		Flux<WorkOrder> workOrderFlux = workOrderRepo.findByKeyword(keyword, pageRequest);

		return Mono.zip(totalElements, workOrderFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(),
						pageRequest.getPageNumber(),
						pageRequest.getPageSize()
				));
	}

	private Mono<PagedResponse<WorkOrder>> getAllWorkOrdersPaged(PageRequest pageRequest) {
		Mono<Long> totalElements = workOrderRepo.count();
		Flux<WorkOrder> workOrderFlux = workOrderRepo.findWorkOrdersPaged();

		return Mono.zip(totalElements, workOrderFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(),
						pageRequest.getPageNumber(),
						pageRequest.getPageSize()
				));
	}

}
