# 🚚 Omnixys Order Service

Der **Omnixys Order Service** ist ein zentraler Bestandteil des Shopping-Moduls innerhalb des [OmnixysSphere](https://github.com/omnixys) Microservice-Ökosystems. Er verwaltet Kundenaufträge, verfolgt deren Status in Echtzeit und reagiert auf relevante Ereignisse entlang der Bestellkette.

---

## 🧹 Features

* 📦 Erstellung und Verwaltung von Bestellungen
* 🔄 Status-Updates & Events (z. B. `OrderCreated`, `OrderShipped`)
* 🔐 Integrierte Rollen- und Zugriffskontrolle via Keycloak
* 🔘 Kommunikation über **GraphQL** (kein REST)
* 📊 Vollständig observable mit **OpenTelemetry**, Prometheus & Tempo
* 🩵 Zentrales Logging mit Kafka & LoggerPlus

---

## ⚙️ Tech-Stack

| Komponente        | Technologie                  |
| ----------------- | ---------------------------- |
| Sprache           | TypeScript                   |
| Framework         | [NestJS](https://nestjs.com) |
| Authentifizierung | Keycloak (OpenID Connect)    |
| Kommunikation     | GraphQL (Code-First)         |
| Logging           | Pino + Kafka (LogEventDTO)   |
| Tracing           | OpenTelemetry + Tempo        |
| Monitoring        | Prometheus + Grafana         |
| Port              | `7102`                       |

---

## 🚀 Schnellstart

```bash
git clone https://github.com/omnixys/omnixys-order-service.git
cd omnixys-order-service
npm install
npm run start:dev
```

> Alternativ via Docker:

```bash
docker-compose up
```

---

## 🔌 GraphQL-Endpunkt

* URL: `http://localhost:7102/graphql`
* Playground: Aktiviert
* Authentifizierung: Bearer Token (Keycloak)

---

## 🧪 Tests

```bash
npm run test
```

Testabdeckung > 80 % wird angestrebt. Coverage-Bericht via `npm run test:cov`.

---

## 🔐 Sicherheit

Sicherheitslücken bitte **nicht öffentlich melden**. Stattdessen:
📧 [security@omnixys.com](mailto:security@omnixys.com)
Siehe [SECURITY.md](./SECURITY.md)

---

## 🤝 Beitrag leisten

Bitte beachte unsere [CONTRIBUTING.md](./CONTRIBUTING.md) Datei für Branch-Konventionen, PR-Workflow und Teststrategie.

---

## 🪪 Lizenz

Lizensiert unter der [GNU General Public License v3.0](./LICENSE)
© 2025 [Omnixys – The Fabric of Modular Innovation](https://omnixys.com)

---
