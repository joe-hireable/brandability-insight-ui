# Brandability Frontend — Strategy

*Last updated: 2024-09-13*

## 1 · Objectives
1. **Primary Goal** — Provide a user-friendly and responsive web interface for trademark lawyers to input trademark details, receive AI-powered opposition predictions, and analyze potential conflicts.
2. **Key Deliverables**
   - A fully functional opposition prediction page allowing users to input applicant/opponent marks and goods/services, and receive detailed analysis from the backend API.
   - Robust user authentication (Email/Password, Google Sign-In) with email verification and password reset capabilities.
   - Clear and intuitive presentation of prediction results, including overall outcome, mark comparison details, and likelihood of confusion.
   - A responsive user interface that works effectively on both desktop and mobile devices.
3. **Success Metrics**
    - Core Web Vitals: Largest Contentful Paint (LCP) < 2.5s for key pages.
    - Core Web Vitals: Interaction to Next Paint (INP) < 200ms.
    - Client-side error rate < 0.1% of sessions.
    - Unit and integration test coverage (Vitest/React Testing Library) ≥ 70% for critical components and logic.
    - User satisfaction: Positive feedback from initial user testing regarding ease of use and clarity of information.

## 2 · Constraints & Assumptions
| Area | Constraint | Notes |
|------|------------|-------|
| Hardware | Modern web browsers on desktop and mobile devices. | Assumes reasonable client-side processing power for React. |
| Budget | Lean/MVP focus. | Prioritize core functionality and user experience for the initial version. |
| Licencing | ISC License (as per `package.json`). | All chosen libraries must be compatible. |
| Backend API | Frontend relies on the existing backend API for predictions and must adhere to its contract (`src/types/trademark.ts`). | Changes to API contract will require frontend updates. |
| Authentication | Firebase Authentication will be used for user management. |

## 3 · High-Level Architecture
```mermaid
flowchart TD
    A[User] --> B{Browser (React App / Vite)}
    B -- HTTPS --> C[/predict API Endpoint]
    B -- Firebase SDK --> D[Firebase Authentication]
    C --> E[Backend AI Service (FastAPI)]

    subgraph "Frontend (Client-Side)"
        B
    end

    subgraph "Backend Services"
        C
        D
        E
    end
```

## 4 · Project Breakdown & Task List

> **Tip:** Convert each unchecked box into a GitHub issue.

### Project 0 – Repository Setup & Configuration
* [x] Initialise repo, licence (`ISC`), `.gitignore`. (Evident from existing files)
* [x] Set up ESLint for linting and Prettier (implied) for formatting. (Evident from `eslint.config.js`)
* [x] Define `.cursorrules` for frontend project conventions. (File `src/.cursorrules` exists)
* [x] Configure `components.json` for `shadcn/ui`. (File `components.json` exists)
* [x] Configure `tsconfig.json` and related files for TypeScript. (Files exist)
* [x] Configure `vite.config.ts` for the build process. (File exists)

### Project 1 – Core UI Framework, Styling & Routing
* [x] Install core dependencies: React, Vite, TypeScript, Tailwind CSS. (Evident from `package.json`)
* [x] Install UI component library: `shadcn/ui` and its Radix UI dependencies. (Evident from `package.json`)
* [x] Install state management & data fetching: TanStack Query. (Evident from `package.json`)
* [x] Install routing: React Router DOM. (Evident from `package.json`)
* [x] Set up base project structure (`src/`, `public/`). (Evident from file tree)
* [x] Implement basic application routing in `src/App.tsx`. (File exists)
* [x] Define global styling, Tailwind theme, and CSS variables in `src/index.css` and `tailwind.config.ts`. (Files exist)

### Project 2 – User Authentication
* [x] Integrate Firebase SDK and configure Firebase app in `src/lib/firebase.ts`.
* [x] Implement `AuthContext.tsx` for global authentication state management.
* [x] Develop `AuthDialog.tsx` component for:
    * [x] Email/Password Sign-Up & Login.
    * [x] Google Sign-In.
    * [x] Forgot Password / Request Password Reset.
* [x] Develop `EmailConfirmed.tsx` page for handling email verification links.
* [x] Develop `ResetPassword.tsx` page for handling password reset links and setting new passwords.
* [x] Update `Header.tsx` to display user status (logged in/out) and provide Sign Out functionality.

### Project 3 – Opposition Prediction Page (`src/pages/OppositionPrediction.tsx`)
* [x] Design and implement input form for Applicant's mark and goods/services.
* [x] Design and implement input form for Opponent's mark (including registration status & number) and goods/services.
* [x] Implement dynamic addition/removal of goods/services entries.
* [x] Integrate `useTrademarkPrediction` hook (`src/hooks/useTrademarkPrediction.ts`) for API calls.
* [x] Ensure form data is correctly typed and transformed to match `PredictionRequest` in `src/types/trademark.ts`.
* [x] Display API results based on `CasePrediction` type:
    * [x] `opposition_outcome` (result, confidence, reasoning).
    * [x] `mark_comparison` (visual, aural, conceptual, overall).
    * [x] `likelihood_of_confusion`.
* [ ] **Implement detailed display for the `goods_services_comparisons` list.** (Requires iterating `GoodServiceComparison[]` and designing UI to show individual G&S pair comparisons).
* [x] Implement loading states during API calls.
* [x] Implement robust error handling and display for form validation and API errors.
* [x] Add "Clear All" functionality to reset the form.
* [x] Add "Back to Dashboard" navigation.

### Project 4 – Static Pages & General UI
* [x] Create `Index.tsx` (Homepage/Landing Page).
* [x] Create `NotFound.tsx` page for handling invalid routes.
* [x] Ensure consistent `Header.tsx` across all pages.
* [x] Ensure responsive design for all pages and key components.
* [ ] Review and enhance accessibility (a11y) of all interactive components.

### Project 5 – State Management & API Services
* [x] Utilize TanStack Query effectively for server state management, caching, and invalidation.
* [x] Maintain `src/lib/api.ts` for all backend communication, ensuring it uses correct types.
* [x] Keep `src/types/trademark.ts` synchronized with the backend Pydantic models.

### Project 6 – Testing & Quality Assurance
* [ ] Write unit tests for utility functions (`src/lib/utils.ts`).
* [ ] Write unit/integration tests for custom hooks (e.g., `useTrademarkPrediction`, `useAuth`).
* [ ] Write component tests for critical UI components (e.g., `AuthDialog.tsx`, `OppositionPrediction.tsx` form sections).
* [ ] Aim for ≥ 70% test coverage.
* [ ] Conduct manual cross-browser testing (Chrome, Firefox, Safari, Edge).
* [ ] Conduct manual responsive design testing on various device sizes.

### Project 7 – Build, Deployment & CI/CD
* [x] Configure Vite for optimized production builds. (File `vite.config.ts` exists)
* [x] Set up Firebase Hosting via `firebase.json` and `.firebaserc`. (Files exist)
* [ ] Create GitHub Actions workflow for:
    * [ ] Linting and formatting checks on push/PR.
    * [ ] Running tests on push/PR.
    * [ ] Automated deployment to Firebase Hosting on merge to `main`/`master` or on tag.
* [ ] Ensure environment variables (`VITE_*`) are correctly managed and documented.

## 5 · Timeline
| Phase | Duration | Key Milestones                                         |
|-------|----------|--------------------------------------------------------|
| 1     | 1-2 Weeks| Core UI shell, routing, Firebase Auth integration complete. `AuthDialog`, `EmailConfirmed`, `ResetPassword` pages functional. |
| 2     | 2-3 Weeks| `OppositionPrediction` page: Form UI built, API integration with `useTrademarkPrediction` hook, basic display of `opposition_outcome`, `mark_comparison`, and `likelihood_of_confusion`. |
| 3     | 1-2 Weeks| `OppositionPrediction` page: Implement detailed display for `goods_services_comparisons`. Refine overall results presentation. |
| 4     | 1 Week   | Comprehensive testing (unit, integration, manual responsive/cross-browser). Bug fixing. |
| 5     | 1 Week   | CI/CD pipeline setup. Final review and preparation for initial user feedback or soft launch. |

*(Timeline is indicative and subject to change based on complexity and resources.)*

## 6 · Decisions Log
| Date       | Decision                                                                 | Rationale                                                                                                                                                                                                                                                         |
|------------|--------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 2024-09-13 | Initial tech stack: Vite, React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Router, Firebase. | Chosen for modern development experience, performance, type safety, rapid UI development, efficient server state management, standard routing solution, and robust BaaS for authentication. Aligns with common best practices for web applications. |
| 2024-09-13 | Use `pnpm` or `bun` for package management if preferred for speed.         | `package.json` shows `npm` and `bun` scripts. Team preference.                                                                                                                                                                                                  |
| 2024-09-13 | Adhere to `.cursorrules` for AI-assisted development.                      | Ensure consistency and leverage AI capabilities effectively.                                                                                                                                                                                                      |

## 7 · Open Questions / Blockers
*   What are the detailed UI/UX design specifications for displaying the `goods_services_comparisons` list on the `OppositionPrediction` page? (e.g., how to present each pair, similarity scores, competitive/complementary flags).
*   Are there any specific performance benchmarks (beyond Core Web Vitals) or stress testing requirements for the frontend?
*   What is the strategy for internationalization (i18n) if it's required for MVP or future iterations? Currently, UI strings are hardcoded.
*   Are there any analytics or user tracking requirements for the MVP?

---