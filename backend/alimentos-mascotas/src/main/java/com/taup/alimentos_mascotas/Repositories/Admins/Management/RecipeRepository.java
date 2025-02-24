package com.taup.alimentos_mascotas.Repositories.Admins.Management;

import com.taup.alimentos_mascotas.Models.Admins.Management.Recipe;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

@ReadingConverter
public interface RecipeRepository extends ReactiveMongoRepository<Recipe, String> {
}
