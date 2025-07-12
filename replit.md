# SkillSwap Platform

## Overview

SkillSwap is a full-stack web application that enables users to exchange skills with each other. The platform allows users to create profiles listing skills they can offer and skills they want to learn, then facilitates connections between users for mutual skill exchange. Built with a modern React frontend and Express.js backend, the application uses PostgreSQL for data persistence and implements session-based authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite for development and production builds
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Express sessions with bcrypt for password hashing
- **API Design**: RESTful API endpoints with JSON responses
- **Middleware**: Custom logging, session management, and error handling

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- Session-based authentication using express-session
- Password hashing with bcrypt
- Protected routes requiring authentication
- User signup/login with email and password

### User Management
- User profiles with skills offered and wanted
- Location-based user information
- Availability scheduling system
- User search and filtering capabilities

### Skill Exchange System
- Skill categorization (offered vs wanted)
- Swap request system with status tracking
- Match scoring algorithm for skill compatibility
- Review and rating system for completed exchanges

### UI Component System
- Consistent design system using shadcn/ui
- Responsive design with mobile-first approach
- Dark/light theme support via CSS custom properties
- Reusable components for skills, user cards, and modals

## Data Flow

### User Registration Flow
1. User submits signup form
2. Backend validates input and checks for existing users
3. Password is hashed and user is created in database
4. Session is established and user is redirected to profile setup

### Skill Matching Flow
1. Users browse available profiles with search/filter options
2. Match scores are calculated based on skill compatibility
3. Users can request skill swaps through modal interface
4. Target users receive notifications and can accept/reject requests

### Request Management Flow
1. Swap requests are created with offered/requested skills
2. Status tracking (pending, accepted, rejected)
3. Users can view and manage their incoming/outgoing requests
4. Completed exchanges can be reviewed and rated

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **framer-motion**: Animation library for landing page
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Backend Dependencies
- **drizzle-orm**: Type-safe database ORM
- **@neondatabase/serverless**: PostgreSQL connection driver
- **express-session**: Session management middleware
- **bcrypt**: Password hashing utility
- **connect-pg-simple**: PostgreSQL session store

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type safety and development tooling
- **drizzle-kit**: Database schema management
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Build Process
- Frontend: Vite builds optimized production bundle to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Database: Drizzle pushes schema changes via `db:push` command

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Session secret configuration for production security
- Development vs production environment handling

### Server Setup
- Express server serves both API routes and static frontend files
- Development: Vite dev server with HMR integration
- Production: Static file serving with Express
- WebSocket support for Neon database connections

### Database Management
- PostgreSQL database hosted on Neon (serverless)
- Schema defined in TypeScript with Drizzle ORM
- Migrations managed through Drizzle Kit
- Connection pooling for efficient resource usage

The application follows a typical full-stack architecture with clear separation between frontend and backend concerns, using modern tooling for type safety, developer experience, and production performance.