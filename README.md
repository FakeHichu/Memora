# Memora

A full-stack camera application with separate frontend and backend components.

## Project Structure

```
.
├── documents/          # All markdown documentation (moved from various locations)
├── backend/            # Backend server implementation
├── frontend/           # Frontend client application
├── database/           # Database-related files
└── ...
```

## Available Scripts

In the project root:

- `npm run dev` - Start both backend and frontend development servers using concurrently
- `npm run frontend` - Start the frontend development server (cd frontend && npm run dev)
- `npm run backend` - Start the backend development server (cd backend && npm run dev)
- `npm run build:backend` - Build the backend
- `npm run typecheck:frontend` - Type-check the frontend
- `npm run typecheck:backend` - Type-check the backend

## Technology Stack

- **Frontend**: SolidJS with Babel plugin module resolver
- **Backend**: Node.js application
- **Dependencies**: zod, minimatch, glob, and other utility packages

## Documentation

All markdown documentation has been consolidated into the `documents/` folder for easy reference.

## Development

To start development:

```bash
npm run dev
```

This will start both the frontend and backend servers concurrently.

For individual component development, use the npm scripts in each directory or refer to the documentation in the `documents/` folder.