package com.taup.alimentos_mascotas.Repositories.Admins.Management;

import com.taup.alimentos_mascotas.Models.Admins.Management.Ingredient;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface IngredientRepository extends ReactiveMongoRepository<Ingredient, String> {

	//TODO: implementar paginaciones
}
