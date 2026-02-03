# Project: MERN-app

## Objective

- Build a simple full stack app set up as a monolithic repo (backend serves frontend from same server)
- Build an app where users can fetch existing items from a database, create a new item, modify it and delete it

## Tech stack

- Frontend: Vite, React 18+, Chakra UI, Typescript, Zustand
- Backend: Node.js, Express, MongoDB, Mongoose, Winston (logging), Typescript,
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
| └── **tests**
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

- 100% coverage of all code
- Unit, integration and E2E tests
- Backend tests located at "root/backend/**tests**"
- Frontend tests located at "root/frontend/**tests**"
- May create sub folders named "unit", "integration", "e2e" when needed

## Boundaries

- Always make sure a test passes before moving on to build the next feature or writing the next test
