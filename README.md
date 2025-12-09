# 🚀 RecruForce 2 - Front-end (Angular)

This repository contains the **front-end web application** of RecruForce 2, developed with **Angular**.  
It provides recruiters with an intuitive interface to manage job offers, track applications, and view candidate profiles.

---

## 🛠️ Tech Stack

- **Framework:** Angular (v17+ / Standalone Components)  
- **Language:** TypeScript  
- **Styles:** SCSS  
- **Communication:** RESTful API via Java Spring Boot (`recruforce2-backend-core`)  

---

## 💡 Project Architecture

The application follows a **Modular and Domain-Oriented Architecture**, ensuring scalability and maintainability.  
It uses **Feature Modules** and layered responsibilities (Core / Shared / Modules).

```

recruforce2-frontend/
├── src/
│   ├── app/
│   │   ├── core/           # Global services, interceptors, guards, data models
│   │   ├── shared/         # Reusable UI components, directives, pipes
│   │   └── modules/        # Functional feature modules (lazy loaded)
│   │       ├── auth/       # Authentication (Login, Register, Reset Password)
│   │       ├── dashboard/  # Main dashboard and statistics
│   │       ├── job-offer/  # Job offer management
│   │       ├── candidate/  # Candidate profiles and CVs
│   │       └── application/ # Application tracking and matching scores
│   └── environments/       # Environment configuration (Dev, Prod)
└── package.json
└── angular.json

````

---

### Core and Shared Layers

| Folder | Purpose | Typical Contents |
|--------|---------|-----------------|
| **`core/`** | Foundation layer containing globally used services, models, interceptors, and guards | `AuthService`, `AuthGuard`, `AuthInterceptor`, `User`, `JobOfferModel` |
| **`shared/`** | Reusable UI components, directives, and pipes usable across modules | `ButtonComponent`, `LoaderComponent`, `DateFormatPipe` |

---

### Feature Modules (`modules/`)

Each folder under `src/app/modules/` represents a major functional domain. Modules use **Lazy Loading** for performance.

| Module | Purpose | Key Components |
|--------|---------|----------------|
| **`auth/`** | User authentication and access control | `LoginComponent`, `RegisterComponent`, `ResetPasswordComponent` |
| **`dashboard/`** | Overview and main activity statistics | `DashboardComponent`, `StatsComponent` |
| **`job-offer/`** | Full lifecycle of job offers | `JobOfferListComponent`, `JobOfferFormComponent`, `JobOfferDetailComponent` |
| **`candidate/`** | Candidate profile management | `CandidateProfileComponent`, `CandidateCvComponent` |
| **`application/`** | Application tracking and matching scores | `ApplicationListComponent`, `ApplicationDetailComponent` |

---

## 🔗 Backend Integration

The front-end communicates exclusively with the **`recruforce2-backend-core`** API.

1. **API URL:** Defined in `src/environments/environment.ts`.  
2. **Security (JWT):** `AuthInterceptor` (`core/interceptors/http-interceptor.ts`) attaches the JWT token to every HTTP request for secure communication.  
3. **Services:** Services in `core/services/` (e.g., `auth.ts`, `user.ts`) encapsulate API call logic.  

---

## ⚙️ Setup and Installation

Clone the repository:

```bash
git clone <your-repo-url>
cd recruforce2-frontend
````

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm start
```

The app should now be running on: `http://localhost:4200`

---

## 🌍 Environment Configuration

Angular environments are stored in `src/environments/`:

| File                  | Purpose                           |
| --------------------- | --------------------------------- |
| `environment.ts`      | Development environment variables |
| `environment.prod.ts` | Production environment variables  |

**Example variables:**

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  jwtTokenKey: 'recruforce2-token'
};
```

---

## 🐳 Deployment & Docker

The front-end is containerized for efficient deployment.

### 1. Build Image

The `Dockerfile` uses a **Multi-Stage Build**:

* **Stage 1 (`build`)**: Node image to compile Angular app in production.
* **Stage 2 (`final`)**: Lightweight Nginx Alpine image to serve static files.

### 2. Run

The compiled application is served by **Nginx** on port **80** inside the container.

### 3. Docker Compose Integration

The front-end service is included in the `docker-compose.yml` of the **`recruforce2-backend-core`** repository for full-stack execution.

```bash
# Example of local execution (outside Docker Compose)
npm start
```

---

## 📂 Folder Structure Details

```
src/
├── app/
│   ├── core/
│   │   ├── services/        # API call logic
│   │   ├── interceptors/    # HTTP interceptors
│   │   └── guards/          # Route guards
│   ├── shared/
│   │   ├── components/      # Reusable UI components
│   │   ├── directives/      # Shared directives
│   │   └── pipes/           # Shared pipes
│   └── modules/
│       ├── auth/            # Login/Register/ResetPassword
│       ├── dashboard/       # Dashboard and Stats
│       ├── job-offer/       # JobOffer CRUD
│       ├── candidate/       # Candidate Profile/CV
│       └── application/     # Application tracking
└── environments/
```

---

## 🔧 Best Practices

* Use **Lazy Loading** for all feature modules to improve performance.
* Keep **Core services singleton** and avoid importing them in feature modules.
* Keep **Shared components** free of business logic; only UI related code.
* Use **Strong typing** for API responses and models.

---

## 📖 References

* [Angular Official Documentation](https://angular.io/docs)
* [Angular CLI](https://angular.io/cli)
* [RecruForce 2 Backend API](backend-repo-link)

