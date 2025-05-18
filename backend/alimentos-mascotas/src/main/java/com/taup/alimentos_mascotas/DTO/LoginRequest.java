package com.taup.alimentos_mascotas.DTO;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
	@NotBlank(message = "El nombre de usuario no puede estar vacío")
	private String email;
	@NotBlank(message = "La contraseña no puede estar vacía")
	private String password;

	// Getters and setters
	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
}