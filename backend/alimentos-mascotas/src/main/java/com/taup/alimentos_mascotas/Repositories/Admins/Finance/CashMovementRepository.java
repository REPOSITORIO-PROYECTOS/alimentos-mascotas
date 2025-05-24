package com.taup.alimentos_mascotas.Repositories.Admins.Finance;

import reactor.core.publisher.Flux;

import java.time.LocalDateTime;

import com.taup.alimentos_mascotas.Models.Admins.Finance.CashMovement;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CashMovementRepository extends ReactiveMongoRepository<CashMovement, String> {
    Flux<CashMovement> findByTitleContainingIgnoreCaseAndDateBetween(
        String keyword, LocalDateTime from, LocalDateTime to);
}
