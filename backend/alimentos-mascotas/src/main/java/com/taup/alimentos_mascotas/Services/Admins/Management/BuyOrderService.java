package com.taup.alimentos_mascotas.Services.Admins.Management;

import com.taup.alimentos_mascotas.Repositories.Admins.Management.BuyOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BuyOrderService {
	private final BuyOrderRepository buyOrderRepo;


}
