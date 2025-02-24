package com.taup.alimentos_mascotas.Utils;

public enum Priority {
	HIGH("Alta"),
	MEDIUM("Media"),
	LOW("Baja");

	private final String description;

	Priority(String description) {
		this.description = description;
	}

	public String getDescription() {
		return description;
	}
}

