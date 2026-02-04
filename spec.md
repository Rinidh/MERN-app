# Project: MERN-app

## Objective

- Build a simple full stack app set up as a monolithic repo (backend serves frontend from same server)
- Build an app where users can fetch existing items from a database, create a new item, modify it and delete it

## Tech stack

- Frontend: Vite, React 18+, Chakra UI, Typescript, Zustand
- Backend: Node.js (version >= 18), Express, MongoDB, Mongoose, Winston (logging), Typescript
- Testing: Vitest, React Testing Library (RTL), Supertest

## Project Folder Structure Tree

root/
├── backend
| ├── config
| | ├── db.ts
| | └── env.ts
| ├── controllers
| | └── product.controller.ts
| ├── expt.ts
| ├── logger.ts
| ├── middleware
| | └── requireJson.ts
| ├── models
| | ├── product.model.mock.ts
| | └── product.model.ts
| ├── routes
| | └── product.route.ts
| ├── server.ts
| ├── tsconfig.json
| ├── vitest.config.ts
| └── \_\_tests\_\_
| ├── db.test.ts
| ├── logger.test.ts
| ├── product.controller.test.ts
| ├── product.route.test.ts
| └── server.integration.test.ts
├── frontend
| ├── eslint.config.js
| ├── index.html
| ├── package-lock.json
| ├── package.json
| ├── README.md
| ├── src
| | ├── App.css
| | ├── App.tsx
| | ├── assets
| | | ├── react.svg
| | | └── vite.svg
| | ├── components
| | | ├── CreatePage.tsx
| | | ├── CustomSpinner.tsx
| | | ├── HomePage.tsx
| | | ├── Navbar.tsx
| | | └── ProductCard.tsx
| | ├── index.css
| | ├── main.tsx
| | ├── pages
| | ├── store
| | | └── product.ts
| | └── util
| | └── index.ts
| ├── tsconfig.json
| └── vite.config.js
├── package-lock.json
├── package.json
├── README.md
├── reminders.txt
└── spec.md

## Commands

- In backend package.json (at root/):

```json
 "scripts": {
    "dev": "cross-env NODE_ENV=development tsx backend/server.ts",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "tsc -p backend/tsconfig.json",
    "build:frontend": "npm run build --prefix frontend",
    "start": "cross-env NODE_ENV=production node backend/dist/server.js",
    "test": "vitest",
    "test:backend": "vitest backend",
    "expt": "tsx backend/expt.ts"
  },
```

- In frontend package.json (located at root/frontend/):

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
```

## Tests

### General info

- Backend tests located at "root/backend/\_\_tests\_\_"
- Frontend tests located at "root/frontend/\_\_tests\_\_"
- File: backend/models/product.model.mock.ts:
  In-memory mock of Product model, used in unit tests to avoid DB dependency
- Logger is silenced during testing
- Express server is not started to listen and DB connection is not automatically done from bootstrap file when in test environment
- Mongoose buffering of 10 seconds is disabled in test environment

### Testing Principles

- Tests must not depend on real external services unless explicitly marked as integration tests
- Database access must be mocked or isolated where possible

### Current State

- Backend:
  - Unit tests for isolated modules (logger, controllers)
  - Integration tests for server and routes
- Frontend:
  - No tests yet
- E2E:
  - Not implemented

### Planned

- Add frontend tests using React Testing Library
- Introduce E2E tests once core features stabilize

## Architectural Boundaries

- Controllers:
  - Orchestrate request/response only
  - No direct DB connection management
  - Should always respond with a status code and json object having either a suitable message or data or both
  - Call `logger.warn("Invalid mongo ID detected: ", invalidMongoId)` when an invalid MongDB object id is detected

- Models:
  - Encapsulate persistence logic
  - Must not depend on Express types

- Server:
  - Responsible for wiring, not business logic

- Tests:
  - Unit tests must not touch the real database
  - Integration tests may establish real connections explicitly

## Notable Files

- backend/expt.ts  
  Scratchpad for isolated experiments (not production code, not tested)
- backend/middleware/requireJson.ts  
  Middleware enforcing JSON-only request bodies

## Runtime Behavior

- Environment variables loaded from .env
- Backend serves frontend static assets in production mode only
- MongoDB connection is established during server startup
- Logger is initialized once and reused across modules

NODE_ENV=production|development|test
