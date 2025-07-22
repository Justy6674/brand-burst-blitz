# JBSAAS Healthcare Platform

## Overview

JBSAAS is a comprehensive healthcare content management platform designed specifically for Australian healthcare professionals. The application provides AHPRA-compliant content generation, social media management, and practice marketing tools while maintaining strict adherence to healthcare advertising regulations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project follows a full-stack TypeScript monorepo architecture with clear separation between client, server, and shared components:

- **Frontend**: React with Vite (client/)
- **Backend**: Express.js server (server/)
- **Shared**: Common schemas and types (shared/)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth with healthcare-specific MFA

### Technology Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom healthcare theme
- **State Management**: TanStack Query for server state, React Context for global state
- **Database**: PostgreSQL (configured for Neon/Supabase)
- **ORM**: Drizzle with TypeScript-first schema definitions
- **Authentication**: Supabase with healthcare compliance features

## Key Components

### Frontend Architecture
- **Component Library**: Radix UI primitives with custom shadcn/ui components
- **Styling System**: Tailwind CSS with CSS variables for theming
- **Routing**: React Router with lazy-loaded pages
- **Forms**: React Hook Form with Zod validation
- **Error Handling**: Global error boundaries with user-friendly messages

### Backend Architecture
- **API Framework**: Express.js with TypeScript
- **Database Layer**: Drizzle ORM with Neon serverless PostgreSQL
- **Request Handling**: JSON/URL-encoded middleware with comprehensive logging
- **Error Management**: Centralized error handling with status codes
- **Development Server**: Vite integration for development mode

### Healthcare-Specific Features
- **AHPRA Compliance Engine**: Real-time content scanning for regulatory compliance
- **TGA Advertising Compliance**: Therapeutic goods advertising rule enforcement
- **Healthcare Professional Authentication**: AHPRA registration verification
- **Multi-Factor Authentication**: Enhanced security for healthcare data
- **Professional Content Templates**: Specialty-specific content generation

## Data Flow

### Database Schema
The application uses a comprehensive PostgreSQL schema with the following core entities:

1. **Users**: Base authentication and profile management
2. **Business Profiles**: Healthcare practice information and branding
3. **Posts**: Content creation with platform-specific optimizations
4. **Calendar Events**: Content scheduling and practice management
5. **Analytics**: Performance tracking and compliance monitoring
6. **Content Templates**: Reusable healthcare-compliant content structures

### Content Generation Pipeline
1. User creates content via forms or AI generation
2. AHPRA compliance engine validates content
3. Content stored in drafts with compliance scores
4. Calendar scheduling with platform optimization
5. Automated publishing with analytics tracking

### Authentication Flow
1. Email/password authentication via Supabase
2. AHPRA registration verification for healthcare users
3. Multi-factor authentication for enhanced security
4. Session management with secure token refresh

## External Dependencies

### Core Infrastructure
- **Supabase**: Authentication, database hosting, and real-time features
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Vite**: Build tool with development server and HMR

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for consistent visual design

### Healthcare Compliance
- **AHPRA API Integration**: Professional registration verification
- **TGA Guidelines Engine**: Therapeutic advertising compliance checking
- **Content Analysis Tools**: AI-powered compliance scanning

### Development Tools
- **TypeScript**: Type-safe development across the stack
- **ESBuild**: Fast JavaScript bundling for production
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React app to static assets
2. **Backend Build**: ESBuild bundles Express server for Node.js
3. **Database Migrations**: Drizzle Kit manages schema updates
4. **Asset Optimization**: Automatic optimization for production deployment

### Environment Configuration
- **Development**: Local Vite dev server with Express API
- **Production**: Static frontend with containerized Express backend
- **Database**: Managed PostgreSQL (Neon/Supabase) with connection pooling

### Healthcare Compliance Considerations
- **Data Security**: Encrypted data storage and transmission
- **Audit Logging**: Comprehensive activity tracking for compliance
- **Backup Strategies**: Regular automated backups with point-in-time recovery
- **Access Controls**: Role-based permissions with healthcare-specific restrictions

The architecture prioritizes healthcare compliance, user experience, and scalability while maintaining a clean separation of concerns between frontend presentation, backend logic, and data persistence layers.

## Recent Changes: Latest modifications with dates

### January 22, 2025 - Supabase Migration Complete
- ✅ Successfully migrated from Lovable to Replit environment  
- ✅ Maintained Supabase database backend exclusively (no Replit PostgreSQL)
- ✅ Updated server/db.ts to use Supabase Admin client with service role key
- ✅ Converted storage layer from Drizzle ORM to native Supabase calls
- ✅ Configured all environment secrets in Replit (OpenAI, Gemini, Supabase)
- ✅ Restored all member tools for paid tiers ($97/$197/$497)
- ✅ Healthcare platform fully operational with AHPRA compliance tools

### January 22, 2025 - External Frontend Integration Ready
- ✅ Implemented CORS configuration for cross-origin blog access
- ✅ Created public read-only API endpoints (/api/public/blog)
- ✅ Added SEO-friendly headers and caching for Google crawlability
- ✅ Built non-technical user integration guide (API_INTEGRATION_GUIDE.md)
- ✅ Published-only filtering for external frontends (security)
- ✅ Simple copy-paste integration examples for any website

### January 22, 2025 - Vercel Deployment Configuration Complete
- ✅ Fixed Vercel deployment configuration with proper serverless functions
- ✅ Created api/index.ts as Vercel serverless function handler
- ✅ Simplified vercel.json configuration for blog API only
- ✅ Environment variables correctly mapped (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- ✅ Local testing confirmed API endpoints working properly
- ✅ Ready for Vercel redeploy with working blog integration
- ✅ Git identity configured for Justy6674 <downscaleweightloss@gmail.com> (replaces Replit default)
- ✅ Created .gitconfig file to enforce correct author identity for all future commits
- ✅ Updated API integration guide with actual domains: www.jbsaas.com and jbsaas.ai
- ✅ Added debug logging to Vercel functions to diagnose deployment issues
- ✅ Improved vercel.json configuration with proper versioning and timeouts