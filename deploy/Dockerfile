# App image (Story 1.5): the PWA and the Spring Boot app in one image, non-root, DHI runtime.
# Build from the repo root:  docker build -f deploy/Dockerfile .   (dev-up.sh --full does this)
# Every FROM is name:tag@digest and listed in deploy/images.yaml (checked by deploy/check-images.sh).

# ---- 1. frontend build -------------------------------------------------------------------------
FROM dhi.io/node:24-alpine3.23-dev@sha256:d331ca42569f4d69779a8a74cf722f7ae709637f49205fcfc1b26ce198c16922 AS frontend
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- 2. jar build (JDK 25), with the PWA inside ----------------------------------------------------------
FROM dhi.io/eclipse-temurin:25-jdk-alpine3.23-dev@sha256:337310214d6ad56c57d7370b67fb7191a297bbd41741a9bf00f6920cdafe0f9d AS backend
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
FROM dhi.io/eclipse-temurin:25@sha256:d0d11acaef8d8cb5874663557a32ad70e800917b9ec7b55977d8c82993daaed5
WORKDIR /app
COPY --from=backend /build/app.jar /app/app.jar
USER 65532
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
