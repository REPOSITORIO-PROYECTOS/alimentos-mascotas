package com.taup.alimentos_mascotas.Repositories.Admins.Finance;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

import com.taup.alimentos_mascotas.Models.Admins.Finance.MP.PaymentRequest;

@Repository
public interface BuyOrderByMercadoPagoRepository extends ReactiveMongoRepository<PaymentRequest, String>  {
    
}
