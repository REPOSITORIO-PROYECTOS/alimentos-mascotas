package com.taup.alimentos_mascotas.DTO;

import com.taup.alimentos_mascotas.Models.Profiles.User;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
public class UserInfo {
	private String id;
	private String name;
	private String surname;
	private String dni;
	private String phone;
	private Set<String> roles = new HashSet<>();
	private String email;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private String modifiedBy;
	private String createdBy;

	public UserInfo(User user) {
		this.id = user.getId();
		this.name = user.getName();
		this.surname = user.getSurname();
		this.dni = user.getDni();
		this.phone = user.getPhone();
		this.email = user.getEmail();
		this.createdBy = user.getCreatedBy();
		this.createdAt = user.getCreatedAt();
		this.updatedAt = user.getUpdatedAt();
		this.modifiedBy = user.getModifiedBy();
		this.roles = user.getRoles();
	}

}