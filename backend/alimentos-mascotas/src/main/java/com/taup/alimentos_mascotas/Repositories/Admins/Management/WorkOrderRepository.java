package com.taup.alimentos_mascotas.Repositories.Admins.Management;

import com.taup.alimentos_mascotas.Models.Admins.Management.WorkOrder;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface WorkOrderRepository extends ReactiveMongoRepository<WorkOrder, String> {

	@Aggregation(pipeline = {
			"{$lookup: {from: 'products', localField: 'productId', foreignField: '_id', as: 'product'}}", // Join con la colección de productos
			"{$unwind: '$product'}", // Descompone el array "product"
			"{$match: {$or: [" +
					"{'product.name': {$regex: ?0, $options: 'i'}}," + // Busca por nombre del producto (insensible a mayúsculas/minúsculas)
					"{'priority': {$regex: ?0, $options: 'i'}}," + // Busca por la descripción de la prioridad
					"{'status': {$regex: ?0, $options: 'i'}}" + // Busca por la descripción del estado
					"]}}"
	})
	Flux<WorkOrder> findByKeyword(String keyword, PageRequest pageRequest);

	@Aggregation(pipeline = {
			"{$lookup: {from: 'products', localField: 'productId', foreignField: '_id', as: 'product'}}",
			"{$unwind: '$product'}",
			"{$match: {$or: [" +
					"{'product.name': {$regex: ?0, $options: 'i'}}," +
					"{'priority': {$regex: ?0, $options: 'i'}}," +
					"{'status': {$regex: ?0, $options: 'i'}}" +
					"]}}",
			"{$count: 'total'}" // Cuenta el total de documentos que coinciden
	})
	Mono<Long> countByKeyword(String keyword);

	@Query("{}")
	Flux<WorkOrder> findWorkOrdersPaged();
}