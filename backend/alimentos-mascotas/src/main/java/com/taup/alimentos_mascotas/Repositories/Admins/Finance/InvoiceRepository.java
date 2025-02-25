package com.taup.alimentos_mascotas.Repositories.Admins.Finance;

import com.taup.alimentos_mascotas.Models.Admins.Finance.Invoice;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface InvoiceRepository extends ReactiveMongoRepository<Invoice, String> {
  @Query("{}")
  Flux<Invoice> findInvoicesPaged(PageRequest pageRequest);
}