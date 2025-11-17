# Package stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY target/*.jar app.jar

# Ortam değişkenlerinin doğru okunmasını garanti altına almak için shell formu kullanılıyor.
ENTRYPOINT java -XX:MaxRAMPercentage=75.0 -jar app.jar
