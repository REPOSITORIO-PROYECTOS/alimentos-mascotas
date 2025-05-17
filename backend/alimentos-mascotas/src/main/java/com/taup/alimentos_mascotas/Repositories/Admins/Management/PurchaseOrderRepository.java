package com.taup.alimentos_mascotas.Repositories.Admins.Management;

import com.taup.alimentos_mascotas.Models.Admins.Management.PurchaseOrder;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.repository.CountQuery;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

@Repository
public interface PurchaseOrderRepository extends ReactiveMongoRepository<PurchaseOrder, String> {

	@Query(value = """
        {
            $and: [
                {
                    $or: [
                        { 'supplierName': { $regex: ?0, $options: 'i' } },
                        { 'ingredients.?0': { $exists: true } }
                    ]
                },
                { 'orderDate': { $gte: ?1, $lte: ?2 } }
            ]
        }
        """)
	Flux<PurchaseOrder> findByKeywordAndDateRange(
			String keyword, // ?0: Término de búsqueda
			LocalDate startDate, // ?1: Fecha de inicio del rango
			LocalDate endDate, // ?2: Fecha de fin del rango
			PageRequest pageRequest // Paginación y ordenamiento
	);

	@CountQuery(value = """
        {
            $and: [
                {
                    $or: [
                        { 'supplierName': { $regex: ?0, $options: 'i' } },
                        { 'ingredients.?0': { $exists: true } }
                    ]
                },
                { 'orderDate': { $gte: ?1, $lte: ?2 } }
            ]
        }
        """)
	Mono<Long> countByKeywordAndDateRange(
			String keyword, // ?0: Término de búsqueda
			LocalDate startDate, // ?1: Fecha de inicio del rango
			LocalDate endDate // ?2: Fecha de fin del rango
	);

	@Query("{}")
	Flux<PurchaseOrder> findPurchaseOrdersPaged(PageRequest pageRequest);
}

