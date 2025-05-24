package com.taup.alimentos_mascotas.Services.Admins.Finance;

import org.springframework.stereotype.Service;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Models.Admins.Finance.MP.PaymentRequest;
import com.taup.alimentos_mascotas.Repositories.Admins.Finance.BuyOrderByMercadoPagoRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class BuyOrderByMercadoPagoService {
    private final BuyOrderByMercadoPagoRepository buyOrderByMercadoPagoRepository;

    public Mono<PaymentRequest> save(PaymentRequest paymentRequest){
        return buyOrderByMercadoPagoRepository.save(paymentRequest);
    }

    public Mono<PaymentRequest> getById(String paymentId) {
        return buyOrderByMercadoPagoRepository.findById(paymentId);
    }

    public Mono<PagedResponse<PaymentRequest>> listAllPaged(int page, int size, String keyword) {
    Flux<PaymentRequest> payments;
    Mono<Long> totalMono;

    if (keyword != null && !keyword.isBlank()) {
        payments = buyOrderByMercadoPagoRepository.findAll()
            .filter(payment -> payment.toString().toLowerCase().contains(keyword.toLowerCase()))
            .skip((long) page * size)
            .take(size);
        totalMono = buyOrderByMercadoPagoRepository.findAll()
            .filter(payment -> payment.toString().toLowerCase().contains(keyword.toLowerCase()))
            .count();
    } else {
        payments = buyOrderByMercadoPagoRepository.findAll()
            .skip((long) page * size)
            .take(size);
        totalMono = buyOrderByMercadoPagoRepository.count();
    }

    return payments.collectList()
        .zipWith(totalMono)
        .map(tuple -> new PagedResponse<PaymentRequest>(
            tuple.getT1(),
            tuple.getT2(),
            page,
            size
        ));
}
    
}
