# RecruForce2 Frontend - Angular 17 🎨

Modern, reactive recruitment platform frontend built with Angular 17+ standalone components.

## 🎯 Features

- **Standalone Components** - Modern Angular architecture
- **Signals** - Reactive state management
- **Lazy Loading** - Optimized performance
- **Tailwind CSS** - Utility-first styling
- **TypeScript Strict** - Type safety
- **RxJS Best Practices** - Proper observable management
- **Role-Based Access** - Guards and permissions
- **Responsive Design** - Mobile-first approach

---

## 🏗️ Architecture

```
recruforce2-frontend/
├── src/
│   ├── app/
│   │   ├── core/                         # Singleton services
│   │   │   ├── auth/
│   │   │   │   ├── guards/
│   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   └── role.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── auth.interceptor.ts
│   │   │   │   │   ├── error.interceptor.ts
│   │   │   │   │   └── loading.interceptor.ts
│   │   │   │   └── services/
│   │   │   │       └── auth.service.ts
│   │   │   ├── layout/
│   │   │   │   ├── header/
│   │   │   │   ├── sidebar/
│   │   │   │   └── footer/
│   │   │   └── services/
│   │   │       ├── api.service.ts
│   │   │       └── notification.service.ts
│   │   │
│   │   ├── shared/                       # Reusable components
│   │   │   ├── components/
│   │   │   │   ├── button/
│   │   │   │   ├── card/
│   │   │   │   ├── modal/
│   │   │   │   ├── table/
│   │   │   │   └── file-upload/
│   │   │   ├── directives/
│   │   │   ├── pipes/
│   │   │   └── models/
│   │   │
│   │   ├── features/                     # Feature modules (lazy-loaded)
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── dashboard/
│   │   │   │   └── dashboard.component.ts
│   │   │   ├── candidates/
│   │   │   │   ├── candidate-list/
│   │   │   │   ├── candidate-detail/
│   │   │   │   └── candidate-form/
│   │   │   ├── job-offers/
│   │   │   │   ├── job-list/
│   │   │   │   ├── job-detail/
│   │   │   │   └── job-form/
│   │   │   ├── applications/
│   │   │   │   ├── application-list/
│   │   │   │   └── application-detail/
│   │   │   ├── interviews/
│   │   │   │   ├── interview-list/
│   │   │   │   └── interview-form/
│   │   │   └── public/                  # Public zone
│   │   │       ├── job-board/
│   │   │       └── apply/
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   │
│   ├── assets/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── styles/
│       ├── main.scss
│       └── tailwind.css
│
├── angular.json
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Angular CLI 17+

### Installation

```bash
# 1. Clone repository
git clone <repo-url>
cd recruforce2-frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp src/environments/environment.ts.example src/environments/environment.ts
# Edit with your backend URL

# 4. Run development server
ng serve

# Open http://localhost:4200
```

---

## 🔧 Configuration

### Environment Variables

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  aiServiceUrl: 'http://localhost:8000',
  n8nWebhookUrl: 'http://localhost:5678/webhook'
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.recruforce2.com/api',
  aiServiceUrl: 'https://ai.recruforce2.com',
  n8nWebhookUrl: 'https://workflows.recruforce2.com/webhook'
};
```

---

## 📦 Key Technologies

- **Angular 17** - Latest stable version
- **TypeScript 5.2** - Strict mode
- **Tailwind CSS 3** - Utility-first CSS
- **RxJS 7** - Reactive programming
- **Angular Signals** - Modern reactivity
- **Standalone Components** - No NgModules

---

## 🎨 Design System

### Components

- **Smart Components** (Container): Logic, state management
- **Dumb Components** (Presentational): Pure, @Input/@Output only

### Styling

- **Tailwind CSS** for utility classes
- **SCSS** for custom styles
- **Mobile-first** responsive design
- **Consistent spacing** (Tailwind scale)

---

## 🔐 Authentication & Authorization

### Login Flow

```typescript
// User logs in
this.authService.login(credentials)
  .subscribe(response => {
    // JWT stored in localStorage
    // User redirected to dashboard
  });
```

### Role-Based Access

```typescript
// Route protection
{
  path: 'candidates',
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['RECRUITER', 'ADMIN'] }
}
```

### HTTP Interceptors

- **AuthInterceptor**: Adds JWT to requests
- **ErrorInterceptor**: Handles API errors
- **LoadingInterceptor**: Shows loading spinner

---

## 📊 State Management

### Signals (Angular 17+)

```typescript
// Component
export class CandidateListComponent {
  candidates = signal<Candidate[]>([]);
  loading = signal<boolean>(false);
  
  constructor(private candidateService: CandidateService) {
    this.loadCandidates();
  }
  
  loadCandidates() {
    this.loading.set(true);
    this.candidateService.getAll()
      .subscribe(data => {
        this.candidates.set(data);
        this.loading.set(false);
      });
  }
}
```

### Services (Singleton)

```typescript
@Injectable({ providedIn: 'root' })
export class CandidateService {
  private apiUrl = `${environment.apiUrl}/candidates`;
  
  getAll(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl);
  }
}
```

---

## 🧩 Feature Modules

### Auth Module

- Login page
- Register page
- Password reset
- JWT token management

### Dashboard Module

- Statistics cards
- Recent applications
- Upcoming interviews
- Quick actions

### Candidates Module

- List all candidates
- Candidate detail view
- CV upload
- Profile editing

### Job Offers Module

- Create job offer
- List active jobs
- Publish to LinkedIn
- Archive jobs

### Applications Module

- View applications
- Filter by score/status
- Accept/Reject
- Schedule interviews

### Public Module

- Job board (public)
- Apply form with CV upload
- Application tracking

---

## 🎯 Routing Strategy

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/jobs', pathMatch: 'full' },
  
  // Public routes
  {
    path: 'jobs',
    loadComponent: () => import('./features/public/job-board/job-board.component')
  },
  {
    path: 'jobs/:id/apply',
    loadComponent: () => import('./features/public/apply/apply.component')
  },
  
  // Auth routes
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
  },
  
  // Protected routes
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component')
  },
  {
    path: 'candidates',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['RECRUITER', 'ADMIN'] },
    loadChildren: () => import('./features/candidates/candidates.routes')
  }
];
```

---

## 🧪 Testing

```bash
# Unit tests
ng test

# E2E tests
ng e2e

# Coverage
ng test --code-coverage
```

---

## 📦 Build & Deploy

### Development Build

```bash
ng build
```

### Production Build

```bash
ng build --configuration production

# Output: dist/recruforce2-frontend/
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist/recruforce2-frontend/browser
```

---

## 🔍 Best Practices

### ✅ DO

- Use standalone components
- Implement OnPush change detection
- Use async pipe for observables
- Lazy load feature modules
- Use TypeScript strict mode
- Follow Angular style guide
- Use Signals for reactive state

### ❌ DON'T

- Subscribe without unsubscribing
- Use any type
- Mutate state directly
- Put logic in templates
- Create circular dependencies
