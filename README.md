# Atomic Influence Platform

A comprehensive influencer marketing platform connecting brands with content creators for authentic campaign collaborations.

## Overview

Atomic Influence is a full-stack application that streamlines the process of matching brands with creators, managing campaigns, tracking performance, and processing payments. The platform features role-based access for admins, brands, and creators.

## Tech Stack

### Frontend
- **Framework**: React 18.3 with TypeScript 5.8
- **Build Tool**: Vite 5.4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS 3.4
- **State Management**: TanStack React Query v5
- **Routing**: React Router v6
- **Animations**: Framer Motion

### Backend
- **Database**: PostgreSQL 14 (Supabase managed)
- **Runtime**: Deno (Supabase Edge Functions)
- **Authentication**: Supabase Auth (JWT-based)
- **Storage**: Supabase Storage (S3-compatible)
- **Real-time**: Supabase Realtime (WebSocket subscriptions)

### Integrations
- **Payments**: Stripe API
- **Email**: Resend API
- **AI Matching**: OpenAI API
- **Social OAuth**: Instagram, TikTok, YouTube

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd atomic-influence-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint

## Project Structure

```
atomic-influence-platform/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components (Admin, Brand, Creator)
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # Supabase client & types
│   ├── lib/             # Utility functions
│   └── main.tsx         # Application entry point
├── supabase/
│   ├── functions/       # Edge Functions (serverless)
│   └── migrations/      # Database migrations
├── public/              # Static assets
└── docs/               # Additional documentation
```

## Features

### For Admins
- Dashboard with platform analytics
- User management (approve/suspend accounts)
- Campaign oversight and moderation
- Matching algorithm configuration
- System monitoring and reporting

### For Brands
- Create and manage campaigns
- Browse creator marketplace
- Review applications
- Track campaign performance
- Manage payments and invoicing

### For Creators
- Complete onboarding and profile setup
- Browse available campaigns
- Submit applications
- Track earnings and performance
- Connect social media accounts

## Database

The platform uses PostgreSQL with 28 migrations covering:
- User profiles and authentication
- Campaign management
- Application workflow
- Payment processing
- Social media integrations
- Analytics and reporting
- Automated scheduling (pg_cron)

## Backend Functions

Serverless functions handle critical operations:
- `campaign-lifecycle` - Campaign state management
- `matching-intelligence` - Creator-campaign matching
- `notifications` - Email and in-app notifications
- `payments` - Stripe payment processing
- `social-connect` - OAuth integrations
- `tracking-links` - Click tracking and analytics
- `user-management` - User administration

## Deployment

### Build for Production

```bash
npm run build
```

The optimized production build will be generated in the `dist/` directory.

### Environment Variables

Required environment variables for production:

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Optional: Third-party integrations
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_AI_API_KEY=
```

Backend environment variables (configured in Supabase dashboard):
```env
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
RESEND_API_KEY=
OPENAI_API_KEY=
```

## Security

- Row-Level Security (RLS) policies on all tables
- JWT-based authentication
- Role-based access control (RBAC)
- Encrypted sensitive data
- HTTPS-only in production
- CORS configuration
- Rate limiting on Edge Functions

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Support

For technical issues or questions, please refer to the documentation in the `docs/` directory or contact the development team.

## License

Proprietary - All rights reserved
