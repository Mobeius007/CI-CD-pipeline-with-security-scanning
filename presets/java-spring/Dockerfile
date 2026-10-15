# Multi-stage hardened Dockerfile for Java / Spring Boot
# Stage 1: Build JAR using Maven
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml ./
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2: Hardened Runtime with JRE
FROM eclipse-temurin:17-jre-alpine AS runner
WORKDIR /app

ENV PORT=8000

# Security: Dedicated unprivileged non-root user (UID 10001)
RUN addgroup -g 10001 appgroup && \
    adduser -u 10001 -G appgroup -s /sbin/nologin -D appuser

COPY --from=builder --chown=appuser:appgroup /app/target/*.jar app.jar

USER appuser:appgroup

EXPOSE 8000

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
