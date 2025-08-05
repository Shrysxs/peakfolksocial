# Peakfolk - Social Group Planning Platform

Peakfolk is a modern social platform that makes casual group plans visible, joinable, and social, moving them out of private WhatsApp chats into a public, discoverable space.

## 🚀 Features

- **Public Plan Discovery**: Browse and search for plans in your area
- **One-Click Joining**: Join plans with capacity management
- **Real-time Chat**: Plan-specific chat rooms for coordination
- **Social Feed**: Share and discover content from your network
- **User Profiles**: Rich profiles with following/follower system
- **Notifications**: Real-time notifications for plan updates
- **PWA Support**: Install as a mobile app
- **Responsive Design**: Works seamlessly on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Firebase (Firestore, Auth, Storage)
- **State Management**: TanStack Query, React Context
- **Forms**: React Hook Form, Zod validation
- **Animations**: Framer Motion
- **Deployment**: Docker, Nginx

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm
- Firebase project
- Domain name (for production)

## 🚀 Quick Start

### Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd peakfolk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Fill in your Firebase configuration in `.env.local`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Deployment

#### Option 1: Automated Deployment

1. **Run the deployment script**
   ```bash
   ./deploy.sh
   ```

2. **Follow the generated instructions**

#### Option 2: Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

#### Option 3: Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t peakfolk:latest .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 peakfolk:latest
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Next.js Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret

# Feature Flags
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
```

### Firebase Setup

1. **Create a Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication, Firestore, and Storage

2. **Configure Authentication**
   - Enable Email/Password authentication
   - Enable Google authentication
   - Configure authorized domains

3. **Set up Firestore**
   - Create a Firestore database
   - Configure security rules (see `firestore.rules`)
   - Set up indexes (see `firestore.indexes.json`)

4. **Configure Storage**
   - Create a Storage bucket
   - Set up security rules for file uploads

## 📱 PWA Configuration

The app is configured as a Progressive Web App with:

- Service worker for offline functionality
- App manifest for installation
- Push notification support
- Offline indicator

## 🔒 Security

- Firebase Security Rules for data access control
- Input validation with Zod
- XSS protection headers
- CSRF protection
- Secure authentication flow

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
