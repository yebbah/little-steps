# Architecture diagrams

Two views of LittleSteps: where it runs (local and cloud) and what it is made of (components). The rules behind them live in the [architecture spine](../.specs/planning-artifacts/architecture/architecture-little-steps-2026-11-05/ARCHITECTURE-SPINE.md) (AD-1 module graph, AD-22 deployment); this page only draws them. If a diagram and the spine disagree, the spine wins: fix the diagram.

Status legend: solid boxes exist today; dashed boxes are planned and arrive with later stories.

## 1. Infrastructure: local and cloud

### Local (available now)

Everything runs on one Mac. Ports are the defaults from `deploy/local.env`; the compose file is `deploy/compose.yaml`.

```mermaid
graph LR
  subgraph phone["Phone (optional)"]
    pwaPhone["PWA in browser"]
  end
  subgraph mac["Developer Mac"]
    browser["Browser: PWA + service worker"]
    ide["Backend from IDE :8080 (profile local)"]
    vite["Vite dev server (proxies /api, /actuator)"]
    ollama["Ollama (native, optional)"]
    ts["Tailscale serve (HTTPS)"]
    subgraph compose["Docker Compose project littlesteps"]
      app["app :8080 (profile full only)<br/>Spring Boot + PWA, non-root"]
      kc["Keycloak :8180"]
      init["keycloak-db-init (one-shot)"]
      pg[("PostgreSQL :5432<br/>schemas: app, keycloak")]
      mail["Mailpit :8025"]
    end
    data[("data/ local storage folder")]
  end
  browser --> vite
  vite -- "/api" --> ide
  browser -- "full mode" --> app
  browser -- "OIDC + PKCE" --> kc
  pwaPhone -- "HTTPS" --> ts
  ts --> app
  app --> pg
  ide --> pg
  app --> data
  kc --> pg
  init -. "creates role + schema" .-> pg
  kc --> mail
  app --> mail
  app -. "AI tasks" .-> ollama
  ide -. "AI tasks" .-> ollama
```

Development mode uses `ide` and `vite`; full mode (`deploy/dev-up.sh --full`) uses `app`. Both talk to the same PostgreSQL, Keycloak and Mailpit.

### Cloud (planned: hosting is decided at launch)

The spine fixes the shape, not the provider: the same compose file and the same app image on a small VM, with managed or hosted services swapped in by Spring profile `prod` and environment variables (AD-22).

```mermaid
graph LR
  subgraph device["Caregiver device"]
    pwa["PWA: React + service worker + Dexie"]
  end
  subgraph vm["Small VM (provider TBD)"]
    proxy["TLS termination on a real domain"]
    app["app container (profile prod)<br/>Spring Boot + PWA + /api + jobs"]
    kc["Keycloak"]
    pg[("PostgreSQL<br/>encrypted disk")]
    files[("Storage volume<br/>AES-GCM ciphertext only")]
    presidio["Presidio (P2)"]
  end
  email["Transactional email"]
  llm["Hosted model, no-training,<br/>US$5 per Family ceiling"]
  push["Browser push services"]
  backup[("Nightly backups, kept 14 days")]
  pwa -- "HTTPS" --> proxy --> app
  pwa -- "OIDC + PKCE" --> kc
  app --> pg
  app --> files
  app --> presidio
  app --> email
  app --> llm
  app --> push
  app -- "admin API" --> kc
  kc --> pg
  pg -.-> backup
  files -.-> backup
```

| Concern | Local | Cloud |
|---|---|---|
| App | IDE run or `--full` image | One container image, profile `prod` |
| Email | Mailpit (catches all mail) | Transactional email provider |
| AI | Ollama on the host | Hosted model set not to train on user data |
| Storage | `data/` folder | Encrypted volume or S3-compatible store |
| HTTPS | `localhost`, or Tailscale for real devices | Real domain with TLS |
| Backups | none | Nightly, 14 days |

## 2. Components

### Backend: modules and ports

One Spring Boot app, a modular monolith (Spring Modulith). Each module is a package under `app.littlesteps`. Solid arrows mean "may call the `api` package of"; the closed set of edges is AD-1 and is checked by `ApplicationModules.verify()`. Only the application shell exists today; the modules arrive with their epics.

```mermaid
graph TD
  subgraph client["Client (browser)"]
    pwa["React PWA"]
  end
  subgraph web["Web layer"]
    rest["REST controllers /api/v1<br/>RFC 9457 problem details"]
    spa["SPA fallback + static PWA"]
  end
  subgraph features["Feature modules"]
    family
    child --> family
    careteam --> family
    goals --> careteam
    goals --> child
    library --> goals
    practice --> goals
    practice --> library
    planning --> goals
    progress --> practice
    summary --> progress
    importer["import"] --> goals
  end
  subgraph platform["Platform modules"]
    ai
    notifications
    audit
    privacy
    metrics
  end
  shared["shared kernel: IDs, FamilyCalendar, StoragePort,<br/>problem-type registry, redacting types"]
  subgraph ports["Ports and adapters (hexagonal)"]
    aiP["AI: Ollama / hosted model"]
    ocrP["OCR"]
    maskP["Masking: Presidio"]
    fileP["File storage"]
    idP["Identity admin: Keycloak"]
    mailP["Email: Mailpit / provider"]
    pushP["Web push"]
    pdfP["PDF"]
  end
  db[("PostgreSQL via JPA + Flyway<br/>tenant column family_id")]
  pwa --> rest
  pwa --> spa
  rest --> features
  features --> shared
  platform --> shared
  library --> ai
  progress --> ai
  summary --> ai
  importer --> ai
  features -. "events" .-> platform
  ai --> aiP
  importer --> ocrP
  importer --> maskP
  shared --> fileP
  family --> idP
  notifications --> mailP
  notifications --> pushP
  summary --> pdfP
  features --> db
  platform --> db
```

### Frontend: PWA components

Offline-first. Reads come from the server or a local snapshot; every write goes through one command outbox (AD-5, AD-23).

```mermaid
graph TD
  subgraph pwa["React PWA (Vite + vite-plugin-pwa)"]
    shell["App shell + routing"]
    screens["Screens and Radix UI components"]
    query["TanStack Query<br/>server state + cache"]
    outbox["Command outbox"]
    dexie[("Dexie / IndexedDB<br/>snapshot, drafts, queued commands")]
    auth["OIDC client (code + PKCE)"]
    api["Typed API client<br/>(openapi-typescript)"]
    sw["Service worker<br/>precache + offline shell"]
  end
  backend["Spring Boot /api/v1"]
  kc["Keycloak"]
  shell --> screens
  screens --> query
  screens -- "enqueue(command)" --> outbox
  query --> api
  query <--> dexie
  outbox <--> dexie
  outbox -- "replay when online" --> api
  api -- "Bearer JWT" --> backend
  auth -- "tokens" --> api
  auth --> kc
  sw -. "caches shell and assets" .-> shell
```

Today the frontend is the scaffold (`App.tsx`, `main.tsx`); the boxes above fill in with the data-layer and authentication stories.

## Keeping these current

Update this page in any story that adds a module, a container, an adapter or an environment, and record it in the changelog's Operations impact table ([CONTRIBUTING](CONTRIBUTING.md#finishing-a-story)).
