# App image (Story 1.5): the PWA and the Spring Boot app in one image, non-root, DHI runtime.
# Build from the repo root:  docker build -f deploy/Dockerfile .   (dev-up.sh --full does this)
# Every FROM is name:tag@digest and listed in deploy/images.yaml (checked by deploy/check-images.sh).

# ---- 1. frontend build -------------------------------------------------------------------------
FROM dhi.io/node:24-alpine3.23-dev@sha256:9df89cda122c694157c12ca34b132297268064f879e84716616b46b75e8798ca AS frontend
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- 2. jar build (JDK 25), with the PWA inside ----------------------------------------------------------
FROM dhi.io/eclipse-temurin:25-jdk-alpine3.23-dev@sha256:2a412585b3e916c7093c02308880f4c81f32cdd12debec324b25a1513a1d9efa AS backend
WORKDIR /build/backend
# Maven comes from the wrapper, pinned by version and SHA-256 (distributionSha256Sum).
COPY backend/mvnw backend/pom.xml ./
COPY backend/.mvn ./.mvn
RUN ./mvnw -B -q dependency:go-offline
COPY backend/src ./src
COPY --from=frontend /build/frontend/dist/ ./src/main/resources/static/
RUN ./mvnw -B -q -DskipTests package \
 && cp target/littlesteps-*.jar /build/app.jar

# ---- 3. runtime: JRE only, non-root -------------------------------------------------------------
FROM dhi.io/eclipse-temurin:25@sha256:f4c6cc2c00486a97b929972a7511f1f892a7f8b807ffe54abe29744b5a607f5d
WORKDIR /app
COPY --from=backend /build/app.jar /app/app.jar
USER 65532
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
