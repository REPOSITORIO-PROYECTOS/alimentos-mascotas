package com.taup.alimentos_mascotas.Repositories.Devs;

import com.taup.alimentos_mascotas.Models.Profiles.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface UserRepository extends ReactiveMongoRepository<User, String> {

    Mono<User> findByEmail(String email);

    // Buscar usuarios por keyword en el título o descripción con paginación
    @Query("{ $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'surname': { $regex: ?0, $options: 'i' } } ] }")
    Flux<User> findByKeywordPaged(String keyword, PageRequest pageRequest);

    // Contar la cantidad de usuarios que coinciden con la keyword
    @Query(value = "{ $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'surname': { $regex: ?0, $options: 'i' } } ] }", count = true)
    Mono<Long> countByKeyword(String keyword);

    // Obtener todos los cursos con paginación
    @Query("{}")
    Flux<User> findUsersPaged(PageRequest pageRequest);
}
