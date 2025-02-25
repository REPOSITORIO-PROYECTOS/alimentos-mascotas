package com.taup.alimentos_mascotas.Repositories.Admins.Finance;

import com.taup.alimentos_mascotas.Models.Admins.Finance.CashRegister;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface CashRegisterRepository extends ReactiveMongoRepository<CashRegister, String> {
    Mono<com.taup.alimentos_mascotas.Models.Admins.Finance.CashRegister> findFirstByIsClosedFalse();
}