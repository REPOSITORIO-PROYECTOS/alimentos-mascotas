package com.taup.alimentos_mascotas.Models.Admins.Finance;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.taup.alimentos_mascotas.Models.ModelClass;
import com.taup.alimentos_mascotas.Utils.PaymentMethod;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class Payment extends ModelClass {
    @Id
    private String id;

    @NotBlank
    @NotNull
    private String courseId;

    @NotBlank
    @NotNull
    private String studentId;

    @Min(value = 0, message = "El valor del pago debe ser 0 o mayor.")
    private Double paymentAmount;

    @Min(value = 0, message = "El valor pagado debe ser 0 o mayor.")
    private Double paidAmount;

    private Boolean hasDebt;

    private Boolean isPaid;

    private PaymentMethod paymentMethod;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private LocalDate paymentDueDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy'T'HH:mm")
    private LocalDateTime lastPaymentDate;
}