package com.taup.alimentos_mascotas.Repositories.Admins.Management;

import com.taup.alimentos_mascotas.Models.Admins.Management.BuyOrder;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.repository.CountQuery;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

@Repository
public interface BuyOrderRepository extends ReactiveMongoRepository<BuyOrder, String> {

	@Query("{ $or: [ { 'status': { $regex: ?0, $options: 'i' } }, { 'orderDate': { $gte: ?1, $lt: ?2 } } ] }")
	Flux<BuyOrder> findByKeywordAndDate(String keyword, LocalDate startMonth, LocalDate endMonth, PageRequest pageRequest);

	@CountQuery("{ $or: [ { 'status': { $regex: ?0, $options: 'i' } }, { 'orderDate': { $gte: ?1, $lt: ?2 } } ] }")
	Mono<Long> countByKeywordAndDate(String keyword, LocalDate startMonth, LocalDate endMonth);

	@Query("{}")
	Flux<BuyOrder> findBuyOrdersPaged(PageRequest pageRequest);

}
