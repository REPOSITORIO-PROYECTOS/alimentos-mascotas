package com.taup.alimentos_mascotas.Utils;

import com.taup.alimentos_mascotas.Models.Admins.Finance.CashRegister;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class MonthlyBalance {
	private List<CashRegister> dailyBalances;
	private BigDecimal totalIncome;
	private BigDecimal totalExpense;
}
