package com.taup.alimentos_mascotas.Models.Admins.Finance.MP;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "payment_mp")
public class PaymentRequest {
    @Id
    private String id;
    private String status;
    private String status_detail;
    private String name;
    private String email;
    private Phone phone;
    private Address address;
    private List<Item> items;
}

