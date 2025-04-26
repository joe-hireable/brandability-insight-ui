# Brandability Frontend

Brandability is a modern, AI-powered decision intelligence platform designed specifically for trademark lawyers. This frontend application provides the user interface for assessing the likelihood of trademark opposition and confusion.

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Environment Variables](#environment-variables)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Usage](#usage)
- [Contributing](#contributing)
- [Accessibility & Internationalization](#accessibility--internationalization)
- [Troubleshooting](#troubleshooting)

---

## Overview
Brandability is a front-end application that helps trademark lawyers assess the likelihood of opposition and confusion between trademarks. It is built with modern web technologies and follows best practices for performance, accessibility, and maintainability.

## Tech Stack
- **Build Tool**: [Vite](https://vitejs.dev/) - Fast frontend tooling.
- **UI Library**: [React](https://react.dev/) - For building user interfaces.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Adds static typing to JavaScript.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework.
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - Re-usable UI components built on Radix UI and Tailwind CSS.
- **Server State**: [TanStack Query](https://tanstack.com/query/latest) - For fetching, caching, and updating server state.
- **Authentication (Optional)**: [Firebase](https://firebase.google.com/) - Can be integrated for user authentication.

## Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js**: Version 18 or higher is recommended. ([Download Node.js](https://nodejs.org/))
- **npm**: Version 9 or higher (usually comes with Node.js) OR **bun** (optional, faster package manager - [Install bun](https://bun.sh/))

## Installation
1. **Clone the repository:**
   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or
   bun install
   ```

## Development
Start the local development server with hot reloading:
```sh
npm run dev
# or
bun run dev
```
- The app will be available at [http://localhost:8080](http://localhost:8080) by default.

## Environment Variables
All environment variables must be prefixed with `VITE_`.
Create a `.env` file in the project root. Example:
```
VITE_API_BASE_URL=https://your-api-url.com
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
# ...other Firebase or app-specific variables
```
See `.env` for required variables. **Never commit secrets to the repository.**

## Building for Production
To create an optimized production build:
```sh
npm run build
# or
bun run build
```
- Output will be in the `dist/` directory.

## Deployment
You can deploy the contents of the `dist/` folder to any static hosting provider (e.g., Vercel, Netlify, Firebase Hosting, AWS S3, Azure Static Web Apps, etc.).

**Example: Deploy to Firebase Hosting**
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize (if not already): `firebase init hosting`
4. Build the app: `npm run build`
5. Deploy: `firebase deploy`

## Usage
- Access the deployed app in your browser.
- Authenticate (if required) and use the trademark prediction features.
- For API integration, ensure your backend is running and accessible at the URL specified in `VITE_API_BASE_URL`.

## Contributing
- Follow the code style enforced by ESLint and Prettier.
- Write clear, descriptive commit messages.
- Add tests for new components or features (React Testing Library, Vitest).
- Document all public APIs and complex logic.
- See `.cursorrules` for project conventions.

## Accessibility & Internationalization
- All interactive components are built with accessibility (a11y) in mind.
- Use semantic HTML and ARIA attributes where appropriate.
- No hardcoded UI strings: use i18n for all user-facing text.

## Troubleshooting
- If you encounter issues with dependencies, try deleting `node_modules` and reinstalling.
- Ensure all required environment variables are set.
- For build or runtime errors, check the browser console and terminal output.
- For further help, open an issue or contact the maintainer.
