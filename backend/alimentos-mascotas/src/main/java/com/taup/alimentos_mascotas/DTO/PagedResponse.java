package com.taup.alimentos_mascotas.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PagedResponse<T> {
	private List<T> content;
	private long totalElements;
	private int page;
	private int size;
}