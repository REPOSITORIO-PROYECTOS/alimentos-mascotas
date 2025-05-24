package com.taup.alimentos_mascotas.Services.Admins.Management;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Service
public class ImageUploadService {

    private final Cloudinary cloudinary;

    public ImageUploadService(
            @Value("${cloudinary.cloud_name}") String cloudName,
            @Value("${cloudinary.api_key}") String apiKey,
            @Value("${cloudinary.api_secret}") String apiSecret
    ) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    public Mono<String> uploadImage(FilePart filePart, String name) {
        return DataBufferUtils.join(filePart.content())
            .flatMap(dataBuffer -> {
                try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                    InputStream inputStream = dataBuffer.asInputStream(true);
                    inputStream.transferTo(outputStream);
                    byte[] bytes = outputStream.toByteArray();

                    Map<String, Object> options = new HashMap<>();
                    options.put("folder", "barker");
                    options.put("resource_type", "image");
                    options.put("public_id", System.currentTimeMillis() + "-" + name.replaceAll("\\s+", "-"));

                    return Mono.fromCallable(() -> cloudinary.uploader().upload(bytes, options))
                            .map(result -> result.get("secure_url").toString())
                            .doOnError(e -> System.err.println("Error subiendo imagen a Cloudinary: " + e.getMessage()));
                } catch (Exception e) {
                    return Mono.error(new RuntimeException("Error al procesar la imagen", e));
                } finally {
                    DataBufferUtils.release(dataBuffer);
                }
            });
    }

    // public Mono<String> uploadImage(FilePart filePart, String name) {
    //     return filePart.content().flatMap(dataBuffer -> {
    //         ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    //         try {
    //             InputStream inputStream = dataBuffer.asInputStream(true);
    //             inputStream.transferTo(outputStream);
    //             byte[] bytes = outputStream.toByteArray();

    //             // Opciones de carga
    //             Map<String, Object> options = new HashMap<>();
    //             options.put("folder", "barker");
    //             options.put("resource_type", "image");
    //             options.put("public_id", System.currentTimeMillis() + "-" + name.replaceAll("\\s+", "-"));
    //             // options.put("tags", department != null ?
    //             //         new String[]{"mascotas", department} : new String[]{"mascotas"});

    //             // long expiresAt = isHomeless
    //             //         ? Instant.now().getEpochSecond() + 30L * 24 * 60 * 60  // 30 días
    //             //         : Instant.now().getEpochSecond() + 365L * 24 * 60 * 60; // 1 año
    //             // options.put("expires_at", expiresAt);
    //             // options.put("invalidate", true);

    //             return Mono.fromCallable(() -> cloudinary.uploader().upload(bytes, options))
    //                     .map(result -> result.get("secure_url").toString());
    //         } catch (Exception e) {
    //             return Mono.error(new RuntimeException("Error al procesar la imagen", e));
    //         }
    //     }).next(); // Tomamos el primer (y único) DataBuffer
    // }
}
