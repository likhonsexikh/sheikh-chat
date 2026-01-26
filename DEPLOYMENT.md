# Sheikh Chat - Deployment Guide

## Overview
This document provides instructions for deploying the Sheikh Chat application with viewport-responsive design and generative UI collapse/extend functionality.

## Prerequisites

### Required Tools
- Node.js (v18 or higher)
- npm or yarn
- Firebase CLI (installed globally)

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firebase Authentication
3. Set up Firestore database with security rules
4. Configure Firebase Hosting

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 3. Login to Firebase
```bash
firebase login
```

### 4. Initialize Firebase Project
```bash
firebase init
```

Select the following options:
- ✅ Firestore: Use existing database
- ✅ Functions: Create a new function
- ✅ Hosting: Configure and deploy Firebase Hosting sites
- ✅ Storage: Configure file storage

## Build & Deploy

### 1. Build the Application
```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Bundle the application with Vite
- Generate optimized production files in `/dist` directory
- Create minified CSS and JavaScript files

### 2. Deploy to Firebase
```bash
firebase deploy
```

This will deploy:
- ✅ Hosting: Static files to Firebase Hosting
- ✅ Firestore: Database rules and indexes
- ✅ Functions: Backend functions (if any)

## Features Deployed

### Viewport-Responsive Design
- **Mobile (≤767px)**: Compact mode with drawer navigation
- **Tablet (768px-1199px)**: Adaptive layout with toggle sidebar
- **Desktop (≥1200px)**: Full layout with permanent sidebar

### Generative UI Features
- **Collapse/Expand**: Toggle chat interface size
- **Fullscreen Mode**: Immersive chat experience
- **Real-time Settings**: Live viewport adjustments
- **Auto-Adaptation**: Dynamic layout based on screen size

### Testing
Access the test page at: `/test-viewport.html`

## Configuration

### Environment Variables
Create `.env.production` file:
```
VITE_GEMINI_API_KEY=your_api_key_here
VITE_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"..."}
```

### Firebase Rules
Ensure Firestore rules are properly configured for:
- User authentication
- Conversation access control
- Message permissions

## Performance Optimizations

### Bundle Analysis
```bash
npm run build -- --mode analyze
```

### Caching Strategy
- Leverages Firebase Hosting CDN
- Optimized asset delivery
- Gzip compression enabled

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors
   - Verify dependencies are installed
   - Ensure Node.js version compatibility

2. **Firebase Deployment Errors**
   - Verify Firebase project initialization
   - Check authentication status
   - Review Firebase rules syntax

3. **Responsive Design Issues**
   - Test on actual devices
   - Use browser developer tools
   - Check viewport meta tags

### Debug Mode
```bash
npm run dev
```

## Monitoring

### Performance Metrics
- Bundle size: ~1.3MB (gzipped: ~414KB)
- Load time: <3 seconds on 3G
- First Contentful Paint: <1 second

### Error Tracking
- Firebase Crashlytics integration
- Console error monitoring
- User feedback collection

## Security

### Best Practices
- API keys stored in environment variables
- Firebase security rules enforced
- Input validation on all forms
- XSS protection enabled

### Authentication
- Firebase Authentication integration
- Email/password and Google OAuth
- Session management

## Support

For issues or questions:
1. Check the [GitHub Issues](https://github.com/likhonsexikh/sheikh-chat/issues)
2. Review Firebase documentation
3. Test with the provided test suite

## Version History

### v1.0.0
- Initial responsive design implementation
- Viewport detection and adaptation
- Collapse/expand functionality
- Fullscreen mode support
- Real-time settings management