# Peakfolk - Social Group Planning Platform

# Peakfolk Social

A modern social platform built with Next.js 15, TypeScript, and Firebase. Features include user authentication, plan creation and management, personal and plan feeds, direct messaging, group chat, and PWA support.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: TanStack React Query
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Animations**: Framer Motion
- **PWA**: Service Worker + Web App Manifest

## Features

- User authentication (email/password, Google)
- Plan creation and management
- Personal feed with posts and stories
- Plan-specific feeds and group chat
- Direct messaging between users
- Real-time notifications
- PWA support with offline capabilities
- Dark/light theme switching
- Advanced search functionality
- Analytics dashboard
- Image upload and storage

## Project Structure

```
app/
├── (app)/              # Main application routes
│   ├── feed/           # Personal feed
│   ├── messages/       # Direct messaging
│   ├── plan/           # Plan management
│   ├── profile/        # User profiles
│   └── search/         # Search
├── (auth)/             # Authentication routes
├── api/                # API routes
├── globals.css         # Global styles
├── layout.tsx          # Root layout
└── page.tsx            # Home page

components/
├── ui/                 # Base UI components
├── advanced-search.tsx
├── create-plan-form.tsx
├── header.tsx
├── navigation.tsx
├── plan-card.tsx
├── post-card.tsx
└── ...

contexts/
└── auth-context.tsx    # Authentication context

hooks/                  # Custom React hooks
├── use-auth.ts
├── use-posts.ts
├── use-plans.ts
└── ...

lib/
├── firebase.ts         # Firebase config
├── firebase-services.ts # Firebase utilities
└── utils.ts

providers/
└── query-provider.tsx  # React Query setup

types/
└── index.ts            # TypeScript definitions
```

## Local Setup

### Prerequisites

- Node.js 18.0.0+
- npm 8.0.0+
- Firebase project

### Installation

1. Clone and install:
   ```bash
   git clone <repository-url>
   cd peakfolk.social
   npm install
   ```

2. Environment setup:
   ```bash
   cp .env.example .env.local
   ```
   
   Configure Firebase variables in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key
   ```

3. Firebase setup:
   - Create Firebase project
   - Enable Authentication (Email/Password, Google)
   - Create Firestore database
   - Enable Storage
   - Copy config to `.env.local`

4. Run development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint
- `npm run type-check` - TypeScript checking

## Deployment to Vercel

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Required Environment Variables

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 📊 Performance

- Next.js Image optimization
- Code splitting and lazy loading
- Bundle optimization
- CDN-ready static assets
- Gzip compression

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
```

## 📈 Monitoring

- Firebase Analytics integration
- Error tracking (configurable)
- Performance monitoring
- User behavior analytics

## 🔄 CI/CD

The project includes:

- Automated deployment scripts
- Docker containerization
- Nginx configuration
- Health check endpoints

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Plans
- `GET /api/plans` - Get plans
- `POST /api/plans` - Create plan
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan

### Posts
- `GET /api/posts` - Get posts
- `POST /api/posts` - Create post
- `DELETE /api/posts/:id` - Delete post

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the Firebase documentation
- Review the Next.js documentation

## 🗺️ Roadmap

- [ ] Advanced search and filtering
- [ ] Plan templates
- [ ] Recurring plans
- [ ] Location-based recommendations
- [ ] Social proof and ratings
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations

---

Built with ❤️ using Next.js and Firebase # peakfolk.social
