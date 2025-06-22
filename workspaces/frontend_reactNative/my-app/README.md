# Safety Companion App 👋

This is a React Native safety companion app built with [Expo](https://expo.dev) that integrates with VAPI assistants for different types of calls.

## Features

- 🎧 **Call Assistant** - General help and assistance
- 👥 **Call Contacts** - Reach your saved contacts with assistant help
- 🚨 **911 Emergency** - Emergency services with location sharing
- 📍 **Location Services** - Automatic location sharing with assistants
- 📱 **Contact Management** - Save and manage emergency contacts

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment variables

   Create a `.env` file with:
   ```bash
   # API Configuration
   EXPO_PUBLIC_API_URL=http://your_backend_ip:3000

   # Google Maps API for enhanced location services
   # Get this from Google Cloud Console - Geocoding API
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

3. Start the app

   ```bash
   npx expo start
   ```

## VAPI Assistant Configuration

The app uses different VAPI assistants for different scenarios:

### 1. General Assistant (`VAPI_ASSISTANT_GENERAL_ID`)
- Used for the main "Call Assistant" button
- Should be configured for general help and assistance
- Gets user location and context

### 2. Contact Assistant (`VAPI_ASSISTANT_CONTACT_ID`) 
- Used when calling saved contacts
- Can be more personal/friendly in tone
- Receives contact name and relationship context
- Gets user location for assistance

### 3. Emergency Assistant (`VAPI_ASSISTANT_EMERGENCY_ID`)
- Used for 911 emergency calls
- Should be focused on emergency response
- Receives emergency context and user location
- Should prioritize getting help quickly

## Location Services

- App automatically requests location permissions
- Location is shared with assistants for better context
- Fallback to coordinates if Google Maps API not configured
- Location updates dynamically during app use

## Running the app

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Backend Setup

Make sure to configure the backend with the appropriate VAPI assistants. See the backend README for configuration details.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
