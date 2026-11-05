---
type: review
lens: versions-and-technology-currency
target: ../ARCHITECTURE-SPINE.md
reviewed: '2026-11-05'
verdict: 'Pass with corrections. Every named technology exists and the core compatibility claims hold, but six version values are stale and one toolchain conflict (TypeScript 7 vs openapi-typescript) blocks AD-16 as written.'
---

# Version and Technology Review — ARCHITECTURE-SPINE (Stack table and named technologies)

**Method.** Each value was checked on 2026-11-05 against primary sources where possible: Maven Central `maven-metadata.xml` and published POMs, the npm registry, GitHub releases and API, the ghcr.io registry, vendor docs (spring.io, docs.hibernate.org, keycloak.org, postgresql.org, Redgate Flyway docs), and the upstream README for Presidio. Web search was used only to find announcements, and its claims were then checked against the registries.

**Verdict.** Pass with corrections. No technology is dead or unfit. All the compatibility pairs called out (Spring AI 2.0 with Boot 4.1, Modulith 2.1 with Boot 4.1, Hibernate `@TenantId` in Boot 4.1's Hibernate, vite-plugin-pwa with Vite 8, Java 25 on Boot 4.1, Keycloak 26.8) are confirmed. But the claim "versions checked on the web on 2026-11-05" does not hold for several rows: they show releases from before October. And the spine never checked one pairing it depends on: the TypeScript version that `npm create vite` now ships, against openapi-typescript (AD-16).

## Findings (ordered by impact)

### F-1 [HIGH] openapi-typescript does not work with TypeScript 7, which the Vite starter now installs (breaks AD-16)

- The `create-vite` `react-ts` template (create-vite 9.3.4) pins `"typescript": "~7.0.2"`.
- The latest `openapi-typescript` is 7.13.0, published 2026-02-11. It declares `peerDependencies: { "typescript": "^5.x" }`, so npm fails with ERESOLVE.
- At runtime it also fails on TS 7 (`TypeError: Cannot read properties of undefined (reading 'createKeywordTypeNode')`), because TS 7's native compiler does not expose the old `ts.factory` JS API. This is tracked upstream in open issues #2841, #2867 and #2872, and none has been fixed yet.
- **Correction (pick one and record it in AD-16 or the Stack table):**
  - (a) Run the codegen in isolation with its own compiler, e.g. `npx -p typescript@5.9.3 -p openapi-typescript@7.13.0 openapi-typescript openapi.json -o src/api/schema.d.ts`, and leave the app on TS 7.0.x. The generated `.d.ts` is plain TypeScript that TS 7 consumes fine. Or:
  - (b) Override the template and pin the frontend to `typescript ~5.9.3` until upstream ships TS 6/7 support.
- Recommended: (a). Add a Stack row: `TypeScript | 7.0.x (app); 5.9.3 (openapi-typescript codegen only)`.

### F-2 [MEDIUM] Presidio moved out of Microsoft. "ghcr.io images" is right, but the full image path is needed

- The repo is now `data-privacy-stack/presidio` (redirected from `microsoft/presidio`). The README says: "The legacy Microsoft Container Registry images at `mcr.microsoft.com/presidio-*` are no longer updated… switch to `ghcr.io/data-privacy-stack/presidio-analyzer`."
- Latest release: **2.2.366** (2026-10-27). ghcr.io carries `2.2.366` plus `-linux-arm64`, `-linux-amd64` and `-distroless` variants, so it runs natively on Apple Silicon for local development.
- **Correction:** `Microsoft Presidio (P2, ghcr.io images)` → `Presidio (P2) | 2.2.366 — ghcr.io/data-privacy-stack/presidio-analyzer (and -anonymizer, -image-redactor if used)`. Drop "Microsoft" from the name, and replace the wildcard `2.2.36x` with a pinned tag, as upstream advises for production.

### F-3 [MEDIUM] Stale patch versions in the Stack table (it claims "checked 2026-11-05")

| Row | Spine says | Current (2026-11-05) | Source |
| --- | --- | --- | --- |
| Spring Boot | 4.1.1 | **4.1.2** (2026-10-22) | Maven Central `spring-boot` metadata; spring.io docs header shows 4.1.2 as current GA |
| Spring Modulith | 2.1.1 | **2.1.2** (2026-10-22) | Maven Central `spring-modulith-bom` metadata |
| Spring AI | 2.0.0 | **2.0.2** (2.0.1 on 2026-08-21, 2.0.2 in late Oct) | Maven Central `spring-ai-bom` metadata; spring.io blog |
| PostgreSQL | 18.4 | **18.6**. The next minor (18.7) is scheduled for **2026-11-12** | postgresql.org `versions.json`, versioning page, and roadmap |
| vite-plugin-pwa | 1.3.0 | **2.0.0** (2026-10-03) | npm registry; GitHub release v2.0.0 |
| Vite | 8.x | 8.3.6 (fine; a precise pin is optional) | npm registry |

About vite-plugin-pwa 2.0.0: the major bump only widens the peer range to `@vite-pwa/assets-generator ^2.0.0`. The Vite peer range is still `^3 … ^8`, Workbox is 7.4.1, and Node must be >= 20.19. Moving to 2.0.0 is safe.

**Correction:** update the rows to the bold values above. For PostgreSQL, pin `18` (major only) in `compose.yaml` image tags, or take 18.7 after 11-12.

### F-4 [LOW, decision point] Spring Boot 4.2 GA is days or weeks away

- `spring-boot` 4.2.0-RC2 was published to Maven Central on 2026-11-05. 4.2.0-M1 came out 2026-08-20 and M2 2026-09-25. Spring Modulith 2.2.0-RC1 and Spring AI 2.1.0-RC2 are also on Central, and Modulith 2.2 targets Boot 4.2.
- Boot 4.1 (GA 2026-06-10) is a supported line, so 4.1 is a valid choice. But a project scaffolded in late November would start on a line that is one minor behind.
- **Correction (optional):** add a note to the Stack table: "If scaffolding after Boot 4.2.0 GA, move as a set to Boot 4.2.x + Modulith 2.2.x + Spring AI 2.1.x. Never mix lines." Otherwise keep 4.1.2 / 2.1.2 / 2.0.2.

### F-5 [LOW] AD-2 / AD-14 / AD-15: `@TenantId` is confirmed, but the spine is silent on two points that need decisions

`@TenantId` partitioned (discriminator) multitenancy is confirmed in Hibernate **7.4.13.Final**, the version Boot 4.1.2 manages. User guide §24.3.1 says: "For the partitioned data approach, each entity representing partitioned data must declare a field annotated @TenantId… automatically populated by Hibernate when an instance is made persistent." Two gaps follow:

- **Cross-tenant jobs.** The AD-14 jobs (reminders, retention) and the AD-15 purge select across all Families. Hibernate 7.4's `CurrentTenantIdentifierResolver` has `default boolean isRoot(T tenantId)` ("Does the given tenant id represent a 'root' tenant with access to all partitions?"). The spine should state that only scheduled jobs run under a root tenant, and that no request path can resolve to it, or else jobs open sessions per Family.
- **Native SQL.** The `@TenantId` filter applies to HQL/Criteria and entity loads. Hand-written native SQL (for example the AD-14 `UPDATE … WHERE` claim) gets no automatic tenant predicate. This point is from documented Hibernate behaviour as generally known; the 7.4 guide text fetched here does not spell it out. **Correction:** add to AD-2 that "native queries must include `family_id` explicitly or run only in root-tenant jobs", and check it with an ArchUnit or test rule.

Spring Boot does not auto-configure a tenant resolver. Wiring it in (a `HibernatePropertiesCustomizer` that registers `hibernate.tenant_identifier_resolver`) is an implementation detail, not a spine change.

## Confirmed as stated (no change needed)

| Item | Spine | Evidence |
| --- | --- | --- |
| Java 25 LTS on Boot 4.1 | 25 | Boot 4.1.2 system requirements: "requires at least Java 17 and is compatible with versions up to and including Java 27." Java 25 is the current LTS. |
| Spring AI 2.0 with Boot 4.1 | 2.0.x | spring.io GA post (2026-06-12): "designed to be used with Spring Boot 4.0 / 4.1 and Spring Framework 7.0". Boot 4.1.2 manages Spring Framework 7.0.10. |
| Spring Modulith 2.1 with Boot 4.1 | 2.1.x | 2.1 milestones built on Boot 4.1 milestones (spring.io M1/M4/RC1 posts). 2.1.0 GA on 2026-06-11, the day after Boot 4.1.0. The 2.2 line moves to Boot 4.2. |
| Hibernate / Flyway / Spring Security / Testcontainers via the Boot BOM | BOM | The Boot 4.1.2 BOM manages Hibernate 7.4.13.Final, Flyway 12.4.0, Spring Security 7.1.2, Testcontainers 2.0.5, PostgreSQL JDBC 42.7.14 and Jackson 3.1.7. Testcontainers 2.x renamed its modules (`org.testcontainers:testcontainers-postgresql`, verified on Central; the old `postgresql` artifact does not exist at 2.0.5). Scaffold accordingly. |
| Flyway with PostgreSQL 18 | n/a | Redgate Flyway PostgreSQL page: "Verified Versions: 9.2, 18". |
| Keycloak 26.8.1 | 26.8.1 | GitHub release 26.8.1 (2026-10-13) is the latest. Its DB docs list PostgreSQL 18 as tested (supported: 14.x–18.x), so sharing the PostgreSQL 18 instance is fine. Note that 26.8 makes the IdP-to-organization link many-to-many (not used here), and 26.8.1 carries security fixes not backported to 26.7. Do not settle for 26.7.x. |
| React | 19.3.1 | npm `latest` 19.3.1 (2026-10-14). The create-vite template uses `^19.3.1`. |
| TanStack Query | 5.x | npm 5.106.1. Peer `react ^18 \|\| ^19`. |
| Dexie | 4.4.7 | npm `latest` 4.4.7 (2026-10-19). |
| Radix Primitives | latest at scaffold | Active. The unified `radix-ui` package is at 1.8.1 (2026-10-12) and supports React 19. Suggest naming the `radix-ui` package explicitly. |
| springdoc-openapi | latest compatible with Boot 4.1 | v3.2.0 (2026-10-24) is "Spring Boot 4.1.x line (built on Spring Boot 4.1.2)". Pin `springdoc-openapi-starter-webmvc-ui 3.2.0`. |
| openhtmltopdf (`io.github.openhtmltopdf`) | 1.1.x | Alive. `openhtmltopdf/openhtmltopdf` is not archived, and 1.1.108 was released 2026-11-01 on PDFBox 3.0.8. Pin 1.1.108. |
| zerodep-web-push-java | 2.1.x | Alive but quiet. `com.zerodeplibs:zerodep-web-push-java` 2.1.5 (2025-12-31) is the latest. The repo is not archived and was last pushed 2026-10-29, though recent commits are mostly Dependabot. The core has no runtime dependencies. Use `zerodep-web-push-java-ext-jwt-nimbus-jose` 2.1.5, since Nimbus is already on the classpath through Spring Security. Keep it behind the push port (it is), because a maintenance-mode library is a replaceable risk. |
| Mailpit | latest (local) | Active: v1.33.0 (2026-10-31). |
| Ollama | latest (host-native) | Active: v0.40.x (0.40.15-rc1 on 2026-11-03). |
| Workbox (inside vite-plugin-pwa) | n/a | workbox-build / workbox-window 7.4.1. |

## Proposed Stack table (replacement rows only)

| Name | Version |
| --- | --- |
| Spring Boot | 4.1.2 (or move as a set to 4.2.x / Modulith 2.2.x / Spring AI 2.1.x if scaffolding after Boot 4.2 GA) |
| Spring Modulith | 2.1.2 |
| Spring AI | 2.0.2 |
| PostgreSQL | 18 (18.6 today; 18.7 due 2026-11-12) |
| TypeScript | 7.0.x for the app; 5.9.3 only for the openapi-typescript codegen step |
| vite-plugin-pwa | 2.0.0 |
| openapi-typescript / springdoc-openapi | 7.13.0 (run with TypeScript 5.9.3) / 3.2.0 |
| openhtmltopdf (`io.github.openhtmltopdf`) | 1.1.108 |
| zerodep-web-push-java (+ `-ext-jwt-nimbus-jose`) | 2.1.5 |
| Presidio (P2) | 2.2.366, `ghcr.io/data-privacy-stack/presidio-analyzer` / `-anonymizer` |

## Sources

- Maven Central metadata and POMs: `org/springframework/boot/spring-boot`, `spring-boot-dependencies/4.1.2`, `org/springframework/ai/spring-ai-bom`, `org/springframework/modulith/spring-modulith-bom`, `org/springdoc/springdoc-openapi-starter-webmvc-ui`, `io/github/openhtmltopdf/openhtmltopdf-pdfbox`, `com/zerodeplibs/zerodep-web-push-java`, `org/testcontainers/testcontainers-postgresql` (repo1.maven.org)
- [Spring Boot 4.1.1 available now](https://spring.io/blog/2026/08/20/spring-boot-4-1-1-available-now/), [Spring Boot 4.2.0-M2](https://spring.io/blog/2026/09/25/spring-boot-4-2-0-M2-available-now/), [Spring Boot system requirements](https://docs.spring.io/spring-boot/system-requirements.html)
- [Spring AI 2.0.0 GA](https://spring.io/blog/2026/06/12/spring-ai-2-0-0-GA-available-now/), [Spring AI 2.0.1](https://spring.io/blog/2026/08/21/spring-ai-2-0-1-available-now), [Spring AI v2.0.2 release](https://newreleases.io/project/github/spring-projects/spring-ai/release/v2.0.2)
- [Spring Modulith 2.1 M4](https://spring.io/blog/2026/03/27/spring-modulith-2-1-m4-2-0-5-and-1-4-10-released/), [Spring Modulith 2.2 M1 / 2.1.1](https://spring.io/blog/2026/08/26/spring-modulith-2-2-m1-2-1-1-2-0-8-and-1-4-13-released/)
- [Hibernate ORM 7.4 User Guide, Multitenancy §24](https://docs.hibernate.org/orm/7.4/userguide/html_single/Hibernate_User_Guide.html), [CurrentTenantIdentifierResolver 7.4 Javadoc](https://docs.hibernate.org/orm/7.4/javadocs/org/hibernate/context/spi/CurrentTenantIdentifierResolver.html)
- [Keycloak releases](https://github.com/keycloak/keycloak/releases), [Keycloak database configuration](https://www.keycloak.org/server/db)
- [PostgreSQL versioning](https://www.postgresql.org/support/versioning/), [PostgreSQL roadmap](https://www.postgresql.org/developer/roadmap/)
- [Flyway PostgreSQL support](https://documentation.red-gate.com/fd/postgresql-database-277579325.html)
- npm registry: `react`, `vite`, `vite-plugin-pwa`, `@tanstack/react-query`, `dexie`, `openapi-typescript`, `radix-ui`, `typescript`, `create-vite`; [create-vite react-ts template](https://github.com/vitejs/vite/blob/main/packages/create-vite/template-react-ts/package.json)
- [vite-plugin-pwa releases](https://github.com/vite-pwa/vite-plugin-pwa/releases)
- [openapi-typescript #2841 "doesn't work with Typescript 7"](https://github.com/openapi-ts/openapi-typescript/issues/2841), #2867, #2872
- [springdoc-openapi v3.2.0](https://github.com/springdoc/springdoc-openapi/releases/tag/v3.2.0)
- [openhtmltopdf releases](https://github.com/openhtmltopdf/openhtmltopdf/releases), [zerodep-web-push-java](https://github.com/st-user/zerodep-web-push-java)
- [Presidio README (data-privacy-stack)](https://github.com/data-privacy-stack/presidio), ghcr.io tag list for `data-privacy-stack/presidio-analyzer`
- [Mailpit releases](https://github.com/axllent/mailpit/releases), [Ollama releases](https://github.com/ollama/ollama/releases)
