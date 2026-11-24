# App image (Story 1.5): the PWA and the Spring Boot app in one image, non-root, DHI runtime.
# Build from the repo root:  docker build -f deploy/Dockerfile .   (dev-up.sh --full does this)
# Every FROM is name:tag@digest and listed in deploy/images.yaml (checked by deploy/check-images.sh).

# ---- 1. frontend build -------------------------------------------------------------------------
FROM dhi.io/node:24-alpine3.23-dev@sha256:abe5e2eb4166f422dea213c4181c1ab069f63bb5d4b4bb0878abba2039fefec6 AS frontend
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- 2. jar build (JDK 25), with the PWA inside ----------------------------------------------------------
FROM dhi.io/eclipse-temurin:25-jdk-alpine3.23-dev@sha256:9ccd430c9ef9c747bb78df43e14599a92416b404c6b65965e94b56c7efcdc977 AS backend
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
FROM dhi.io/eclipse-temurin:25@sha256:6d19fe86794c4e6aa17e10090227658d99dc9fa525135e18acf5477bdce9e795
WORKDIR /app
COPY --from=backend /build/app.jar /app/app.jar
USER 65532
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
