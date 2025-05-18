package com.taup.alimentos_mascotas.DTO;

import java.util.Set;

import lombok.Data;

@Data
public class UserCredentialsDTO {
	private String id;
	private String token;
	private String username;
	private String name;
	private Set<String> roles;
}