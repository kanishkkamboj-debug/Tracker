# ──────────────────────────────────────────────────────────────────────────────
# TrackFlow Backend Dockerfile
# Multi-stage build: compile with Maven, run with JRE 21 slim
# ──────────────────────────────────────────────────────────────────────────────

FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Cache Maven dependencies
COPY .mvn/       .mvn/
COPY mvnw        mvnw
COPY pom.xml     pom.xml
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q

# Build the JAR
COPY src/        src/
RUN ./mvnw package -DskipTests -q

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
