FROM node:20-alpine AS frontend-build
WORKDIR /app/sv-lms-frontend
COPY sv-lms-frontend/package*.json ./
RUN npm ci
COPY sv-lms-frontend/ ./
RUN npm run build

FROM maven:3.9.9-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY sv-lms-backend/pom.xml sv-lms-backend/pom.xml
WORKDIR /app/sv-lms-backend
RUN mvn -q dependency:go-offline
WORKDIR /app
COPY sv-lms-backend/ sv-lms-backend/
COPY --from=frontend-build /app/sv-lms-frontend/dist/ sv-lms-backend/src/main/resources/static/
WORKDIR /app/sv-lms-backend
RUN mvn -q clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/sv-lms-backend/target/sv-lms-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
