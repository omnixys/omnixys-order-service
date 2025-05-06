# GentleCorp-Order-Service

Der **GentleCorp-Order-Service** ist ein zentraler Bestandteil des **GentleCorp-Ecosystems**. Er ermöglicht das Erstellen, Aktualisieren und Verwalten von Bestellungen und ist darauf ausgelegt, mit hoher Performance und Skalierbarkeit zu arbeiten.

## Übersicht

- **Framework**: [NestJS](https://nestjs.com/)
- **Sprache**: TypeScript
- **Protokoll**: REST
- **Funktionalität**:
  - Erstellen von Bestellungen
  - Aktualisierung bestehender Bestellungen
  - Statusverfolgung von Bestellungen
  - Integration mit anderen Services wie Payment, Inventory und Customer

---

## Anforderungen

### Systemanforderungen
- Node.js Version 18 oder höher
- NPM Version 9 oder höher

### Installation

1. Repository klonen:
   ```bash
   git clone https://github.com/GentleCorp/gentlecorp-order-service.git
   cd gentlecorp-order-service
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

3. Umgebungsvariablen konfigurieren:
   Erstelle eine `.env`-Datei basierend auf `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Beispiel-Variablen:
   ```
   PORT=3000
   DATABASE_URL=mongodb://localhost:27017/orders
   ```

4. Anwendung starten:
   ```bash
   npm run start
   ```

---

## API-Endpunkte

### Basis-URL
```
http://localhost:3000/api/orders
```

### Verfügbare Endpunkte

1. **GET** `/orders`
   - Beschreibung: Liste aller Bestellungen abrufen.
   - Query-Parameter: `status` (optional) - Filter nach Status.

2. **POST** `/orders`
   - Beschreibung: Neue Bestellung erstellen.
   - Body:
     ```json
     {
       "username": "string",
       "items": [
         { "productId": "string", "quantity": 1 }
       ]
     }
     ```

3. **PATCH** `/orders/:id`
   - Beschreibung: Eine bestehende Bestellung aktualisieren.
   - Body:
     ```json
     {
       "status": "shipped"
     }
     ```

4. **DELETE** `/orders/:id`
   - Beschreibung: Eine Bestellung löschen.

---

## Entwicklung

### Skripte
- **Starten der Anwendung**:
  ```bash
  npm run start
  ```
- **Entwicklung**:
  ```bash
  npm run start:dev
  ```
- **Tests ausführen**:
  ```bash
  npm run test
  ```

### Architektur
- **Controller**: Handhabt HTTP-Anfragen und leitet sie an die entsprechenden Services weiter.
- **Service**: Enthält die Business-Logik.
- **Repository**: Schnittstelle zur Datenbank.

---

## Tests

Das Projekt enthält Unit- und Integrationstests. Stelle sicher, dass vor dem Deployment alle Tests erfolgreich ausgeführt werden:

```bash
npm run test
```

---

## Docker

### Docker-Setup
1. Baue das Docker-Image:
   ```bash
   docker build -t gentlecorp-order-service .
   ```

2. Starte den Container:
   ```bash
   docker run -d -p 3000:3000 gentlecorp-order-service
   ```

### Docker Compose
Alternativ kannst du Docker Compose nutzen:
```bash
docker-compose up
```

---

## Beitrag leisten

Wir freuen uns über Beiträge zu diesem Projekt! Weitere Details findest du in der Datei [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe [LICENSE](LICENSE) für weitere Details.

