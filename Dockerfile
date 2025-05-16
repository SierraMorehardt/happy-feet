# Use Maven to build the application
FROM eclipse-temurin:17-jdk-ubi9-minimal AS build

# Install Maven
RUN microdnf install -y maven

WORKDIR /app
COPY pom.xml .
COPY src ./src
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Use a lightweight JRE for running the application
FROM eclipse-temurin:17-jre-ubi9-minimal
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Expose the default Spring Boot port
EXPOSE 8080
# Run the application
ENTRYPOINT ["java","-jar","app.jar"]
