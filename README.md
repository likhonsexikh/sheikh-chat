# Sheikh Chat - AI Chat Application

A modern, responsive AI chat application built with React, Ant Design X 2.0, Firebase, and Google Gemini API.

## Features

### 🚀 Core Features
- **Secure Authentication**: Google OAuth with Firebase Auth
- **AI-Powered Chat**: Google Gemini API integration with streaming responses
- **Conversation History**: Persistent chat history with Firestore
- **Real-time Updates**: Live conversation synchronization
- **Responsive Design**: Works seamlessly on desktop and mobile

### 🔒 Security & Performance
- **Backend Proxy**: Secure Firebase Functions to protect API keys
- **Rate Limiting**: Built-in protection against API abuse
- **Input Validation**: Sanitized user inputs and message length limits
- **Firestore Security Rules**: Proper data access controls
- **reCAPTCHA Integration**: Bot protection on login

### 🎨 Enhanced User Experience
- **Dark Theme**: Premium dark mode interface
- **Conversation Management**: Create, view, and delete conversations
- **Real-time Typing**: Live conversation updates
- **Error Handling**: Graceful error recovery and user feedback
- **Loading States**: Smooth loading indicators

### 🤖 Agent System (Advanced)
- **Multi-Agent Architecture**: Specialized agents for different tasks
- **Task Orchestration**: Intelligent task routing and management
- **Priority System**: High/Medium/Low priority task handling
- **Extensible Design**: Easy to add new agent types

### 📊 Production Ready
- **Analytics**: Built-in usage tracking and monitoring
- **Error Tracking**: Comprehensive error logging and reporting
- **Performance Monitoring**: Usage metrics and performance insights
- **Scheduled Cleanup**: Automatic old conversation cleanup
- **Type Safety**: Full TypeScript implementation

## Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Ant Design X 2.0** - Modern UI components (Bubble, Sender)
- **Ant Design 6** - Additional UI components
- **Firebase Web SDK** - Authentication and Firestore

### Backend
- **Firebase Functions** - Serverless backend
- **Firebase Firestore** - NoSQL database
- **Firebase Auth** - Authentication service
- **Google Gemini API** - AI model integration
- **Express.js** - API framework

### Development
- **Vite** - Fast build tool and dev server
- **ESLint** - Code quality and consistency
- **TypeScript** - Type safety

## Installation

### Prerequisites
- Node.js (v18 or higher)
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud project with Gemini API enabled

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sheikh-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions
   npm install
   ```

3. **Environment Configuration**
   Create `.env.local` in the root directory:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

   # reCAPTCHA Configuration
   VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key

   # Gemini API Configuration (for local development)
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Google provider)
   - Enable Firestore Database
   - Enable reCAPTCHA in Authentication settings
   - Set up Firestore security rules (provided in repo)

5. **Backend Configuration**
   - Create a Google Cloud project
   - Enable the Gemini API
   - Create API keys
   - Set up Firebase Functions environment variables:
     ```bash
     firebase functions:setEnvVars GEMINI_API_KEY=your-gemini-api-key
     ```

## Development

### Running Locally
```bash
# Start frontend development server
npm run dev

# Start Firebase Functions emulator
cd functions
npm run serve
```

### Building for Production
```bash
# Build frontend
npm run build

# Deploy Firebase Functions
firebase deploy --only functions

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## Project Structure

```
sheikh-chat/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── Login.tsx           # Authentication component
│   │   ├── EnhancedChatInterface.tsx  # Main chat interface
│   │   └── ...
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx     # Authentication context
│   ├── hooks/                  # Custom hooks
│   │   └── useGemini.ts        # Gemini API integration
│   ├── agents/                 # Agent system
│   │   └── AgentSystem.ts      # Multi-agent architecture
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # Shared types
│   ├── utils/                  # Utility functions
│   │   └── analytics.ts        # Analytics tracking
│   ├── firebase.ts             # Firebase configuration
│   └── App.tsx                 # Main application component
├── functions/                   # Firebase Functions backend
│   ├── src/
│   │   └── index.ts            # Main functions file
│   ├── package.json            # Functions dependencies
│   └── tsconfig.json           # TypeScript configuration
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── firebase.json               # Firebase configuration
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore indexes
└── README.md                   # This file
```

## API Endpoints

### Backend Functions
- `POST /api/gemini/chat` - Secure Gemini API proxy
- `GET /api/conversations/:userId` - Get conversation history
- `DELETE /api/conversations/:userId/:conversationId` - Delete conversation
- `GET /api/health` - Health check endpoint

### Frontend Hooks
- `useGemini()` - Gemini API integration with streaming
- `useAuth()` - Authentication state management

## Security Features

### Backend Security
- **API Key Protection**: Gemini API keys stored securely in Functions environment
- **Rate Limiting**: 60 requests per minute per user
- **Input Validation**: Message length limits and content sanitization
- **Authentication**: JWT token validation for all API calls
- **CORS Protection**: Proper CORS configuration

### Frontend Security
- **reCAPTCHA**: Bot protection on login
- **Input Sanitization**: Client-side input validation
- **Secure Storage**: No sensitive data stored in localStorage

### Database Security
- **Firestore Rules**: Users can only access their own data
- **Data Validation**: Server-side data validation
- **Audit Logging**: All operations logged for security

## Performance Optimizations

### Frontend
- **Component Memoization**: Optimized re-renders with useCallback and useMemo
- **Virtualization Ready**: Designed for future message list virtualization
- **Lazy Loading**: Components loaded on demand
- **Bundle Optimization**: Tree-shaking and code splitting

### Backend
- **Connection Pooling**: Efficient database connections
- **Caching**: Strategic caching for frequently accessed data
- **Rate Limiting**: Prevents API abuse
- **Error Handling**: Graceful degradation on failures

## Monitoring & Analytics

### Built-in Analytics
- **User Actions**: Track user interactions and behavior
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Monitor response times and usage
- **Conversation Analytics**: Track conversation patterns

### Firebase Integration
- **Firebase Analytics**: Built-in usage tracking
- **Firebase Crashlytics**: Error reporting and crash tracking
- **Firebase Performance**: Performance monitoring
- **Firebase Monitoring**: Uptime and health monitoring

## Deployment

### Firebase Deployment
1. **Initialize Firebase project**
   ```bash
   firebase init
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

3. **Configure Custom Domain** (optional)
   - Add custom domain in Firebase Console
   - Configure SSL certificates
   - Update DNS settings

### Environment Variables
Set these in Firebase Functions environment:
- `GEMINI_API_KEY` - Google Gemini API key
- `FIREBASE_CONFIG` - Firebase configuration (auto-set)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Join our Discord community (link to be added)
- Email: support@sheikhchat.com

## Contributing Organizations

This project was developed with contributions from:
- **MiniMax** - Agent system architecture and multi-agent capabilities
- **Firebase Team** - Backend infrastructure and security
- **Google AI** - Gemini API integration and AI capabilities

## Future Roadmap

- [ ] **Voice Input/Output** - Speech-to-text and text-to-speech integration
- [ ] **File Upload** - Support for images, documents, and code files
- [ ] **Code Execution** - Safe code execution environment
- [ ] **Multi-language Support** - Internationalization and localization
- [ ] **Advanced Analytics** - Detailed usage analytics and insights
- [ ] **Mobile App** - Native iOS and Android applications
- [ ] **Team Collaboration** - Multi-user chat rooms and collaboration features
- [ ] **Plugin System** - Extensible plugin architecture for custom functionality

---

**Made with ❤️ by the Sheikh Chat Team**