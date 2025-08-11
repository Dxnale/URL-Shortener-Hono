# URL Shortener – Serverless & Cloud-based

Un servicio de acortamiento de URLs **seguro, escalable y económico**, desarrollado con **[HonoJS](https://hono.dev/)** y desplegado en **AWS Lambda + API Gateway + Aurora Serverless v2 (PostgreSQL)**.
Incluye cache y rate-limiting en fases posteriores, siguiendo buenas prácticas de backend y arquitectura serverless.

---

## 🚀 Tecnologías principales
- **Backend**: [HonoJS](https://hono.dev/) (Node.js 20.x runtime en AWS Lambda)
- **Base de datos**: Aurora Serverless v2 (PostgreSQL-compatible)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Infraestructura**: AWS Lambda + API Gateway
- **Configuración & Deploy**: Serverless Framework + esbuild
- **Seguridad**: Secrets en AWS SSM Parameter Store
- **Fase 3 (futura)**: Cache Redis (ElastiCache), rate-limiting, escaneo anti-phishing

---

## 🏗 Arquitectura

```mermaid
flowchart TD
    A[Cliente / Navegador] -->|Request Short URL| B[API Gateway]
    B --> C[AWS Lambda HonoJS]
    C -->|Query / Insert| D[(Aurora Serverless v2 - Postgres)]
    C -->|Read / Cache Miss| E[(Redis - ElastiCache)]:::future
    C -->|Cache Hit| E
    D -->|Respuesta| C
    E -->|Respuesta| C
    C -->|Redirect 301/302| A

    classDef future fill:#f9f,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5
````

📌 **Notas**:

* **Aurora Serverless v2** → escala a 0 ACUs cuando no hay tráfico, optimizando costes.
* **Lambda** → paga solo por ejecución, ideal para cargas variables.
* **Redis** (fase 3) → reduce latencia en redirecciones frecuentes.
* **API Gateway** → punto de entrada seguro, soporta HTTPS.

---

## 📚 Documentación

- Arquitectura por capas: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Plan y checklist de mejoras: [docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md)

---

## 📦 Instalación local

### Requisitos previos

* [Bun](https://bun.sh/) o Node.js >= 18
* PostgreSQL
* AWS CLI configurada
* Serverless Framework

### Pasos

```bash
git clone https://github.com/tuusuario/url-shortener.git
cd url-shortener
bun install
npx prisma migrate dev
bun run src/server.ts
```

---

## ☁️ Despliegue en AWS

```bash
serverless deploy
```

La URL pública se mostrará en la salida:

```
https://abc123.execute-api.eu-west-1.amazonaws.com
```

---

## 📈 Roadmap

* [x] Sprint 1: MVP local con HonoJS + Postgres + Prisma
* [x] Sprint 2: Deploy AWS Lambda + Aurora Serverless v2 + Secrets en SSM
* [ ] Sprint 3: Cache Redis + Rate-limiting + Escaneo anti-phishing
* [ ] Sprint 4: Analytics y panel de métricas
* [ ] Sprint 5: Multi-region y CDN (CloudFront)

---

## 🛡 Seguridad y buenas prácticas

* Validación de URLs con Zod.
* Variables de entorno seguras en AWS SSM.
* Deploy serverless para minimizar superficie de ataque.
* (Próximo) Rate limit per IP y API key.
* (Próximo) Escaneo de URLs contra listas negras.

---

## 📚 Créditos

Proyecto desarrollado por **[Daniel Torrealba](https://linkedin.com/in/tu-perfil)** como demostración técnica de arquitectura serverless moderna.
