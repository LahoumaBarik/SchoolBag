# SchoolBag Mobile - React Native App

This is the mobile version of SchoolBag, built with React Native and Expo. It provides the same functionality as the web version but optimized for mobile devices.

## Features ✨

- **Authentication**: Secure login and registration
- **Task Management**: Create, edit, delete, and organize tasks
- **Calendar View**: Interactive calendar with task heatmap
- **Task Filtering**: Filter by status (pending, in-progress, completed, overdue)
- **Profile Management**: User profile with statistics and settings
- **Real-time Sync**: Shares the same backend as the web version

## Prerequisites 📋

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device (for testing)

## Installation & Setup 🚀

### 1. Navigate to Mobile Directory
```bash
cd mobile
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Backend URL

**Important**: You need to update the API URL for mobile testing.

Edit `src/context/AuthContext.js`:

```javascript
// For Expo Go (device testing): Use your computer's IP address
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000/api';

// For simulator: You can use localhost
const API_BASE_URL = 'http://localhost:5000/api';
```

**To find your computer's IP address:**

- **Windows**: Open Command Prompt and run `ipconfig`
- **Mac/Linux**: Open Terminal and run `ifconfig`
- Look for your network adapter's IPv4 address (usually starts with 192.168.x.x)

Example: `http://192.168.1.105:5000/api`

### 4. Start the Backend Server

Make sure your backend server is running in another terminal:

```bash
# In the root project directory
cd server
npm start
```

### 5. Start the Mobile App

```bash
npx expo start
```

## Testing the App 📱

### Option 1: Using Expo Go (Recommended for Testing)

1. Install "Expo Go" app from App Store (iOS) or Google Play (Android)
2. Scan the QR code displayed in terminal with your phone
3. The app will load on your device

### Option 2: Using iOS Simulator (Mac only)

1. Install Xcode from Mac App Store
2. Press `i` in the Expo CLI to open iOS simulator

### Option 3: Using Android Emulator

1. Install Android Studio
2. Set up an Android Virtual Device (AVD)
3. Press `a` in the Expo CLI to open Android emulator

## Project Structure 📁

```
mobile/
├── App.js                 # Main app component with navigation
├── src/
│   ├── context/
│   │   ├── AuthContext.js      # Authentication state management
│   │   └── TaskContext.js      # Task state management
│   ├── screens/
│   │   ├── LoginScreen.js      # Login interface
│   │   ├── RegisterScreen.js   # Registration interface
│   │   ├── TasksScreen.js      # Task management screen
│   │   ├── CalendarScreen.js   # Calendar with heatmap
│   │   └── ProfileScreen.js    # User profile and settings
│   └── components/
│       ├── TaskItem.js         # Individual task display
│       └── TaskFormModal.js    # Task creation/editing modal
├── package.json
└── README.md
```

## Key Features in Detail 🔧

### Authentication
- Email/password login and registration
- JWT token authentication
- Persistent login state using AsyncStorage
- Secure logout functionality

### Task Management
- Create tasks with title, subject, description, due date, and priority
- Edit existing tasks
- Delete tasks with confirmation
- Change task status (pending → in-progress → completed)
- Filter tasks by status and see overdue tasks

### Calendar View
- Monthly calendar with task density heatmap
- Color-coded intensity based on number of tasks per day
- Tap dates to see tasks for that specific day
- Navigation between months
- Task statistics for the current month

### Profile Screen
- User information display
- Task completion statistics
- Progress tracking with completion percentage
- Settings menu (placeholders for future features)
- Logout functionality

## API Integration 🔌

The mobile app uses the same REST API as the web version:

- **Authentication**: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- **Tasks**: `/api/tasks` (GET, POST, PUT, DELETE)
- **Calendar**: `/api/tasks/calendar/:year/:month`

## Troubleshooting 🔧

### Common Issues:

**1. "Network request failed" errors:**
- Check that your backend server is running
- Verify the API_BASE_URL in AuthContext.js is correct
- Make sure your phone and computer are on the same WiFi network

**2. "Expo Go couldn't connect to development server":**
- Restart the Expo development server (`npx expo start`)
- Clear Expo cache: `npx expo start --clear`
- Check firewall settings on your computer

**3. App crashes on startup:**
- Check for JavaScript errors in the terminal
- Verify all dependencies are installed: `npm install`
- Try resetting cache: `npx expo start --clear`

## Development Commands 💻

```bash
# Start development server
npx expo start

# Start with cache cleared
npx expo start --clear

# Install new dependencies
npm install package-name

# Check for issues
npx expo doctor
```

## Building for Production 📦

For production builds, you'll need to:

1. Configure app.json with your app details
2. Set up proper API endpoints
3. Use EAS Build: `npx eas build`

See [Expo documentation](https://docs.expo.dev/build/introduction/) for detailed build instructions.

## Technology Stack 🛠️

- **React Native**: Mobile app framework
- **Expo**: Development platform and tools
- **React Navigation**: Navigation library
- **Axios**: HTTP client for API requests
- **AsyncStorage**: Local data persistence
- **Ionicons**: Icon library

## Contributing 🤝

This mobile app maintains feature parity with the web version. When adding new features:

1. Follow the existing file structure
2. Use consistent styling patterns
3. Test on both iOS and Android
4. Update this README with any new setup requirements

## Support 🆘

If you encounter issues:

1. Check this README for common solutions
2. Verify your backend server is running
3. Check the Expo CLI terminal for error messages
4. Ensure all dependencies are properly installed

---

**Note**: This mobile app shares the same MongoDB database as the web version, so all data is synchronized between platforms. 