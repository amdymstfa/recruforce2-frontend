# RecruForce2 - Complete Architecture 🏗️

Comprehensive architectural documentation of the RecruForce2 system with its 4 microservices.

---

## 🎯 Overview

RecruForce2 is an intelligent recruitment platform based on a **microservices architecture** using the following technologies:

- **Backend**: Spring Boot 3.2 (Java 21)  
- **Frontend**: Angular 17 (TypeScript 5)  
- **AI Service**: FastAPI (Python 3.11)  
- **Workflows**: N8N (Node.js)  

---

## 📊 Global Architecture

```

┌─────────────────────────────────────────────────────────────────┐
│                        RECRUFORCE2                              │
│                 Microservices Architecture                      │
└─────────────────────────────────────────────────────────────────┘

```
                ┌──────────────────┐
                │   Load Balancer  │
                │   (Nginx/ALB)    │
                └────────┬─────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    ▼                    ▼                    ▼
```

┌───────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend    │    │   Backend    │    │ AI Service   │
│   Angular 17  │───►│ Spring Boot  │───►│ FastAPI      │
│   Port: 4200  │    │ Port: 8080   │    │ Port: 8000   │
└───────────────┘    └───────┬──────┘    └──────┬───────┘
│                   │
│                   │
▼                   ▼
┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │   MongoDB    │
│  Port: 5432  │    │  Port: 27017 │
└──────────────┘    └──────────────┘
│
│
▼
┌──────────────┐
│     N8N      │
│  Workflows   │
│  Port: 5678  │
└──────────────┘

```

---

## 🔄 Complete Data Flow

### Scenario 1: Job Application

```

1. Candidate visits /jobs → Frontend Angular
   └─► GET /api/job-offers → Backend Spring Boot
   └─► Returns list of job offers

2. Candidate clicks "Apply" → Frontend displays form

3. Candidate fills form + uploads CV → Frontend
   └─► POST /api/candidates (create profile) → Backend
   └─► Returns candidateId: 1

   └─► POST /api/candidates/1/cv (file upload) → Backend
   ├─► Saves to /uploads/cvs/uuid.pdf
   └─► Trigger webhook → N8N
   └─► POST [http://localhost:5678/webhook/cv-parsing](http://localhost:5678/webhook/cv-parsing)

4. N8N receives webhook
   └─► POST [http://localhost:8000/api/parse-cv](http://localhost:8000/api/parse-cv) → AI Service
   ├─► Parse CV with spaCy NLP
   ├─► Extract skills, experience, languages
   └─► Save to MongoDB (`parsed_cvs` collection)
   └─► Returns parsed data

5. N8N receives parsed data
   └─► PUT /api/candidates/1 → Backend (update with parsed data)

6. Frontend submits application
   └─► POST /api/applications → Backend
   └─► Trigger webhook → N8N
   └─► POST [http://localhost:8000/api/match-score](http://localhost:8000/api/match-score) → AI
   └─► Calculates matching score (0-100)
   └─► Returns score: 75/100

7. N8N receives score
   ├─► PATCH /api/applications/1 → Backend (update score)
   ├─► Send email → Candidate (confirmation)
   └─► Send email → Recruiter (new application 75/100)

8. Frontend displays confirmation "Application submitted!"

```

---

## 🗄️ Databases

### PostgreSQL (Backend)

**Main tables:**
- `users` (admins, recruiters, managers)
- `candidates` (candidate profiles)
- `job_offers` (job postings)
- `applications` (applications)
- `interviews` (interviews)
- `skills` (skills)
- `feedbacks` (evaluations)
- `notifications`
- `predictions` (ML predictions)
- `audit_logs`

**Connections:**
- Backend → PostgreSQL (JPA/Hibernate)
- N8N → PostgreSQL (own DB)

### MongoDB (AI Service)

**Collections:**
- `parsed_cvs` (CVs parsed with NLP)
- `ai_logs` (all AI operation logs)

**Connections:**
- AI Service → MongoDB (Motor/PyMongo)
- Backend reads `parsed_cvs` via AI Service API

---

## 🔐 Security & Authentication

### JWT Flow

```

1. User login → Backend
2. Backend generates JWT (24h) + Refresh Token (7 days)
3. Frontend stores tokens in localStorage
4. Each request → Header: Authorization: Bearer {token}
5. Backend validates JWT via JwtAuthenticationFilter
6. Token expired → Frontend refreshes with refresh token

```

### Role-Based Access Control (RBAC)

```

Roles:
├── ADMIN         → Full access
├── RECRUITER     → Manage applications & job offers
├── MANAGER       → View interviews & feedbacks
└── PUBLIC        → Browse jobs & apply

Angular Guards:
├── AuthGuard     → Check authentication
└── RoleGuard     → Check required roles

Backend:
└── @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")

````

---

## 🚀 Deployment

### Development

```bash
# 1. Backend
cd /var/www/html/A2/recruforce2
mvn spring-boot:run --spring.profiles.active=dev

# 2. AI Service
cd /var/www/html/A2/recruforce2-ai-model
./run.sh

# 3. N8N
cd /var/www/html/A2/recruforce2-workflows
docker-compose up -d

# 4. Frontend
cd /var/www/html/A2/recruforce2-frontend
ng serve
````

### Production (Docker)

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  frontend:
    build: ./recruforce2-frontend
    ports: ["80:80"]
  
  backend:
    build: ./recruforce2
    ports: ["8080:8080"]
    depends_on: [postgres, mongodb]
  
  ai-service:
    build: ./recruforce2-ai-model
    ports: ["8000:8000"]
    depends_on: [mongodb]
  
  n8n:
    build: ./recruforce2-workflows
    ports: ["5678:5678"]
  
  postgres:
    image: postgres:15
    volumes: [postgres-data:/var/lib/postgresql/data]
  
  mongodb:
    image: mongo:6.0
    volumes: [mongo-data:/data/db]
```

---

## 📈 Performance & Scalability

### Implemented Optimizations

**Frontend:**

* Lazy loading modules
* OnPush change detection
* Signals for reactivity
* Standalone components (smaller bundle)

**Backend:**

* Connection pooling (HikariCP)
* Redis cache (optional)
* Pagination on all lists
* Optimized PostgreSQL indexes

**AI Service:**

* Async processing (FastAPI)
* Model caching in memory
* MongoDB indexes for frequent queries

### Horizontal Scalability

```
Load Balancer
    ├─► Frontend [Instance 1, 2, 3] → CDN
    ├─► Backend  [Instance 1, 2, 3] → PostgreSQL (Master-Slave)
    └─► AI Service [Instance 1-5] → MongoDB (Replica Set)
```

**Why scale AI first?**

* CV parsing = CPU intensive (spaCy NLP)
* Matching = heavy calculations
* ML predictions = high RAM usage

---

## 🔍 Monitoring & Observability

### Logs

```
Backend   → /var/log/recruforce2/application.log
AI        → /app/logs/ai_service.log
N8N       → Docker logs
Frontend  → Browser console
```

### Metrics (Recommended)

```
Prometheus + Grafana:
├── Backend  → Actuator metrics
├── AI       → Custom metrics endpoint
├── N8N      → Workflow execution metrics
└── PostgreSQL → pg_stat_statements
```

### Health Checks

```
Backend:   GET http://localhost:8080/actuator/health
AI:        GET http://localhost:8000/health
N8N:       GET http://localhost:5678/healthz
Frontend:  Service worker health
```

---

## 🧪 Tests

### Backend (Spring Boot)

```
Unit Tests:        85% coverage
Integration Tests: Repositories + H2
E2E Tests:        Controllers + MockMvc
```

### AI Service (Python)

```
Unit Tests:       CV Parser, Matching, Prediction
Integration:      MongoDB + Endpoints
```

### Frontend (Angular)

```
Unit Tests:       Components + Services
E2E Tests:       Cypress/Playwright
```

---

## 📚 Documentation

Each repo contains:

* `README.md` : Setup & Quick Start
* `ARCHITECTURE.md` : Detailed Architecture
* `/docs` : In-depth documentation
* Swagger/OpenAPI : Auto-generated API docs

**Documentation URLs:**

* Backend API: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
* AI API: [http://localhost:8000/docs](http://localhost:8000/docs)
* N8N Workflows: [http://localhost:5678](http://localhost:5678)

---

## 🎯 Future Roadmap

### Short Term

* [ ] Integration tests Backend ↔ AI
* [ ] CI/CD Pipeline (GitHub Actions)
* [ ] Kubernetes deployment manifests

### Medium Term

* [ ] Redis cache for performance
* [ ] Elasticsearch for advanced search
* [ ] WebSocket for real-time notifications

### Long Term

* [ ] Mobile app (React Native)
* [ ] Multi-tenancy
* [ ] Advanced ML models (Deep Learning)

