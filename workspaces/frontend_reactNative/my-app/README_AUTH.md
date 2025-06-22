# Authentication Setup Guide

## Overview
Your React Native app now has a complete authentication system that integrates with your MongoDB backend. Here's how it works:

## Features
- ✅ **JWT-based authentication** with secure token storage
- ✅ **Login & Registration** with form validation
- ✅ **Automatic token refresh** and expiration handling
- ✅ **Protected routes** - redirects to login when not authenticated
- ✅ **Clean, modern UI** with loading states and error handling
- ✅ **MongoDB integration** using your existing user model

## Setup Instructions

### 1. Install Dependencies
```bash
cd workspaces/frontend_reactNative/my-app
npm install
```

### 2. Configure Backend URL
Update the `.env` file with your backend server URL:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start Your Backend
Make sure your MongoDB backend is running:
```bash
cd workspaces/backend
npm run dev
```

### 4. Start Your React Native App
```bash
cd workspaces/frontend_reactNative/my-app
npm start
```

## How It Works

### Authentication Flow
1. **App starts** → Checks for existing token
2. **No token** → Redirects to login screen
3. **User logs in** → Token stored securely, redirected to main app
4. **Token expires** → Automatically redirects to login

### API Integration
- **Login**: `POST /auth/login` with `{ userName, password }`
- **Register**: `POST /auth/register` with `{ userName, password }`
- **Profile**: `GET /auth/profile` (requires authentication)

### Screen Structure
```
app/
├── _layout.tsx          # Root layout with AuthProvider
├── (tabs)/
│   └── index.tsx        # Authenticated home screen
└── auth/
    ├── login.tsx        # Login screen
    └── register.tsx     # Registration screen
```

### Key Components
- **AuthProvider**: Manages authentication state
- **AuthWrapper**: Handles navigation based on auth state
- **API Service**: Manages HTTP requests with automatic token attachment

## User Experience

### Login Screen
- Username/password validation
- Loading states during authentication
- Error handling with user-friendly messages
- Link to registration screen

### Registration Screen
- Username validation (3-20 characters)
- Password validation (minimum 6 characters)
- Password confirmation
- Automatic login after successful registration

### Home Screen
- Personalized welcome message
- User profile information
- Logout functionality
- Clean dashboard layout

## Security Features
- Tokens stored in Expo SecureStore (encrypted)
- Automatic token attachment to API requests
- Token expiration handling
- Input validation and sanitization

## Customization

### Styling
All screens use a consistent design system with:
- Modern card layouts
- Consistent color scheme
- Responsive design
- iOS/Android platform adaptations

### API Configuration
Update `services/api.ts` to modify:
- Base URL
- Request/response interceptors
- Error handling logic

### Navigation
Modify `app/_layout.tsx` to change:
- Authentication flow logic
- Loading screen appearance
- Route protection rules

## Testing
1. **Registration**: Create a new account
2. **Login**: Sign in with existing credentials
3. **Token persistence**: Close and reopen app (should stay logged in)
4. **Logout**: Use logout button in home screen
5. **Error handling**: Try invalid credentials

## Backend Requirements
Your backend must have these endpoints:
- `POST /auth/login` - Returns `{ success, token, user }`
- `POST /auth/register` - Returns `{ success, token, user }`
- `GET /auth/profile` - Returns `{ success, user }` (requires Bearer token)

## Troubleshooting

### Common Issues
1. **Network Error**: Check backend URL in `.env`
2. **Login Failed**: Verify backend is running and endpoints work
3. **Token Issues**: Clear app data or check SecureStore
4. **Navigation Issues**: Ensure all auth screens are properly registered

### Debug Tips
- Check network requests in browser dev tools (for web)
- Use React Native Debugger for detailed inspection
- Monitor backend console for authentication errors
- Check Expo logs for client-side errors

Your authentication system is now ready to use! 🎉 