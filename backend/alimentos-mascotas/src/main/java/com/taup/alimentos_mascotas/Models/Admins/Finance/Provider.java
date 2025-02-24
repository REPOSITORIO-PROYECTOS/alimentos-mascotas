package com.taup.alimentos_mascotas.Models.Admins.Finance;

import com.taup.alimentos_mascotas.Models.ModelClass;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;

@Getter
@Setter
public class Provider extends ModelClass {
    @Id
    private String id;

    @NotBlank(message = "El nombre no puede estar en blanco.")
    @Size(min = 3, max = 20, message = "El nombre debe contener entre 3 a 20 caracteres.")
    private String name;

    @NotBlank(message = "El CUIL/CUIT no puede estar en blanco.")
    @Size(min = 11, max = 15, message = "El CUIL/CUIT debe contener entre 11 a 15 caracteres.")
    private String cuilCuit;

    @Size(min = 0, max = 150, message = "La descripción debe tener 150 caracteres máximo.")
    private String description;

    private Boolean isActive;

    private String address;

    private String phone;
}