package com.taup.alimentos_mascotas.Repositories.Admins.Management;

import com.taup.alimentos_mascotas.Models.Admins.Management.WorkOrder;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkOrderRepository  extends ReactiveMongoRepository<WorkOrder, String> {
}
