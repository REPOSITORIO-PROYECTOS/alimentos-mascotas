# imagen base ligera de Java 17
FROM amazoncorretto:17-alpine-jdk

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el archivo JAR generado al contenedor
COPY target/alimentos-mascotas-0.0.1-SNAPSHOT.jar app.jar

#puerto por defecto de Spring Boot
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]