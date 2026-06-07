# NexusIQ Platform - Setup & Running Guide

## Project Overview
NexusIQ Platform is a full-stack quiz and learning management system with:
- **Frontend**: Next.js 16 with TypeScript, Tailwind CSS, React Query, Zustand
- **Backend**: NestJS with PostgreSQL, Prisma ORM, JWT authentication
- **Features**: Quiz creation, AI-powered content generation, real-time updates, user profiles, streaks

## Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL 12+ (for database)

## Installation

### 1. Install Dependencies

**Frontend:**
```bash
cd nexusiq-platform
npm install
```

**Backend:**
```bash
cd nexusiq-platform/nexusiq-server
npm install
```

### 2. Environment Setup

**Frontend (.env.local)** - Already configured:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXTAUTH_SECRET=nexusiq_nextauth_secret_change_me
NEXTAUTH_URL=http://localhost:3000
```

**Backend (.env)** - Already configured:
```
DATABASE_URL=postgresql://user:password@localhost:5432/nexusiq
DIRECT_URL=postgresql://user:password@localhost:5432/nexusiq
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRY=7d
```

### 3. Database Setup

**Create PostgreSQL database:**
```bash
createdb nexusiq
```

**Run migrations:**
```bash
cd nexusiq-server
npx prisma migrate dev
```

## Running the Application

### Option 1: Run Both Servers (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd nexusiq-platform/nexusiq-server
npm run start:dev
```
Backend runs on: `http://localhost:4000/api/v1`

**Terminal 2 - Frontend:**
```bash
cd nexusiq-platform
npm run dev
```
Frontend runs on: `http://localhost:3000`

### Option 2: Production Build

**Build both projects:**
```bash
cd nexusiq-platform
npm run build
cd nexusiq-server
npm run build
```

**Run production:**
```bash
# Backend
npm run start:prod

# Frontend
npm start
```

## Available Scripts

### Frontend
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run lint` - Run linter

### Backend
- `npm run start:dev` - Start with hot reload
- `npm run build` - Build TypeScript
- `npm run start:prod` - Run production build
- `npm run lint` - Fix linting issues
- `npm test` - Run unit tests
- `npm run test:e2e` - Run E2E tests

## Project Structure

```
nexusiq-platform/
├── src/                          # Frontend (Next.js)
│   ├── app/                      # Pages & routing
│   ├── components/               # React components
│   ├── lib/                      # Utilities & API client
│   └── store/                    # Zustand state management
├── nexusiq-server/               # Backend (NestJS)
│   ├── src/
│   │   ├── auth/                 # Authentication module
│   │   ├── quiz/                 # Quiz module
│   │   ├── attempt/              # Quiz attempts module
│   │   ├── ai/                   # AI integration module
│   │   ├── prisma/               # Database service
│   │   └── common/               # Filters & interceptors
│   └── prisma/
│       └── schema.prisma         # Database schema
└── public/                       # Static assets
```

## Key Features

- **Authentication**: JWT-based with refresh tokens
- **Quiz Management**: Create, edit, delete quizzes
- **AI Content Generation**: Generate quizzes using AI
- **Real-time Updates**: WebSocket support for live data
- **User Profiles**: Track XP, levels, achievements, streaks
- **Classroom Management**: Invite codes, group quizzes
- **Proctoring**: Track violations during quiz attempts
- **Responsive Design**: Mobile-friendly interface

## Troubleshooting

**Port Already in Use:**
- Frontend: Change port in next.config.ts
- Backend: Set PORT environment variable

**Database Connection Errors:**
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Run `npx prisma db push` to sync schema

**API Connection Issues:**
- Ensure NEXT_PUBLIC_API_URL matches backend URL
- Check CORS configuration in backend
- Verify JWT_SECRET matches in both projects

## Tech Stack

**Frontend:**
- Next.js 16.2.6
- React 19
- TypeScript
- Tailwind CSS 4
- React Query 5
- Zustand 5
- Framer Motion
- Three.js (3D effects)

**Backend:**
- NestJS 11
- PostgreSQL
- Prisma 6
- JWT Authentication
- WebSockets
- Socket.io

## Deployment

Both projects can be deployed to:
- **Frontend**: Vercel, Netlify, AWS Amplify
- **Backend**: Heroku, Railway, AWS EC2, DigitalOcean

Set environment variables in your hosting platform and run builds as shown above.

## Support

For issues or questions, check the README files in each directory or review the code comments.

---

**Last Updated**: May 10, 2026
**Status**: ✅ Ready for Development
