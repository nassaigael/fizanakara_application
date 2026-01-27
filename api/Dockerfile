# Stage 1: Build (Maven)
FROM maven:3.9.6-eclipse-temurin-17 AS builder

# Copie pom.xml et source
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Build JAR (skip tests pour speed)
RUN mvn clean package -DskipTests

# Stage 2: Run (OpenJDK 17 slim)
FROM eclipse-temurin:17-jre-alpine

# Expose port 3000 (ton server.port)
EXPOSE 3000

# Copie JAR du build
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Run JAR (Spring Boot auto-config)
ENTRYPOINT ["java", "-jar", "app.jar"]