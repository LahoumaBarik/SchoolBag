# SchoolBag - Smart Academic Assistant

SchoolBag is an intelligent academic task management application designed to help students organize their academic tasks, track deadlines, and visualize their workload through an interactive calendar with heatmap functionality.

## 🎯 Project Overview

This project implements **Week 2**, **Week 3**, and **Sprint 2** milestones:
- **Week 2**: Secure authentication system with MongoDB integration
- **Week 3**: Complete task CRUD operations with calendar visualization  
- **Sprint 2**: Enhanced user experience with home page, notifications, and rich notes functionality

## ✨ Features Implemented

### Week 2 - Authentication & Database Foundation
- ✅ User registration and login with JWT authentication
- ✅ Secure password hashing with bcrypt
- ✅ Protected routes with middleware
- ✅ MongoDB User collection with proper validation
- ✅ "Who am I" endpoint for user profile retrieval

### Week 3 - Task Management & Calendar
- ✅ Complete Task CRUD operations (Create, Read, Update, Delete)
- ✅ Task filtering and sorting capabilities
- ✅ Interactive calendar with task heatmap visualization
- ✅ Task status management (pending → in-progress → completed)
- ✅ Priority levels and task categories
- ✅ Due date tracking with overdue detection

### Sprint 2 - Enhanced User Experience
- ✅ **New Home Page**: Todoist-inspired landing page with CTA, benefits, and social proof
- ✅ **Notifications System**: Real-time notifications with bell icon and dropdown for web
- ✅ **Push Notifications**: Native mobile push notifications for task due date reminders
- ✅ **Rich Notes**: Markdown-supported notes with context-aware templates linked to tasks
- ✅ **Mobile Notes UI**: Slide-up panel for mobile with full Markdown editing support
- ✅ **Real-time Sync**: Automatic sync of notes between web and mobile platforms (30-second intervals)

## 🛠 Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **CORS** for cross-origin requests

### Web Frontend
- **React.js** with functional components and hooks
- **React Router** for navigation
- **Axios** for API calls
- **React Context API** for state management
- **date-fns** for date manipulation
- **Lucide React** for icons
- **React Toastify** for notifications
- **Markdown rendering** for rich notes display

### Mobile Frontend
- **React Native** with Expo
- **React Navigation** for mobile navigation
- **AsyncStorage** for local data persistence
- **Axios** for API calls
- **React Context API** for state management
- **Ionicons** for mobile icons
- **Expo Notifications** for push notifications
- **React Native Markdown Display** for rich notes rendering

## 📁 Project Structure

```
SchoolBag/
├── server/                     # Backend API
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── taskController.js  # Task management logic
│   │   ├── noteController.js  # Notes management logic
│   │   └── notificationController.js # Notifications logic
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Task.js           # Task schema
│   │   ├── Note.js           # Notes schema
│   │   └── Notification.js   # Notification schema
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── tasks.js          # Task management routes
│   │   ├── notes.js          # Notes management routes
│   │   └── notifications.js  # Notification routes
│   ├── server.js             # Main server file
│   ├── package.json          # Backend dependencies
│   └── config.env            # Environment variables
├── client/                    # Web Frontend React app
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/         # Login/Register components
│   │   │   ├── calendar/     # Calendar with heatmap
│   │   │   ├── common/       # Shared components
│   │   │   ├── dashboard/    # Main dashboard
│   │   │   ├── home/         # New home page components
│   │   │   ├── layout/       # Navigation with notifications
│   │   │   ├── notifications/ # Notification bell and dropdown
│   │   │   └── tasks/        # Task management with notes
│   │   ├── context/
│   │   │   ├── AuthContext.js # Authentication state
│   │   │   ├── TaskContext.js # Task state management
│   │   │   └── NotificationContext.js # Notification state
│   │   ├── App.js            # Main app component
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Global styles
│   └── package.json          # Frontend dependencies
├── mobile/                    # Mobile React Native app (Expo)
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskItem.js   # Enhanced with notes access
│   │   │   ├── TaskFormModal.js # Task creation/editing
│   │   │   └── TaskNotesModal.js # Notes slide-up panel
│   │   ├── context/
│   │   │   ├── AuthContext.js # Authentication state
│   │   │   ├── TaskContext.js # Task state management
│   │   │   └── NotesContext.js # Notes state management
│   │   ├── screens/
│   │   │   ├── TasksScreen.js # Enhanced with notes
│   │   │   ├── CalendarScreen.js
│   │   │   └── ProfileScreen.js
│   │   ├── services/
│   │   │   └── NotificationService.js # Push notifications
│   │   ├── App.js            # Main app component
│   │   ├── app.json          # Expo configuration
│   │   └── package.json      # Mobile dependencies
└── documents/                # Project documentation
    ├── Nouveau_Cahier_des_Charges_SchoolBag.md
    └── _MConverter.eu_20250529192658_Analyse_Besoins_SchoolBag_Detaillee (3).md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository** (if not already done)
2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install web frontend dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **Install mobile app dependencies (optional):**
   ```bash
   cd ../mobile
   npm install
   npm install -g @expo/cli
   ```

### Configuration

1. **Set up MongoDB:**
   - Install MongoDB locally, OR
   - Create a MongoDB Atlas account and get connection string

2. **Configure environment variables:**
   - Copy `server/config.env` and update MongoDB connection if needed
   - Default local MongoDB: `mongodb://localhost:27017/schoolbag`

### Running the Application

1. **Start the backend server:**
   ```bash
   cd server
   npm start
   ```
   Server will run on `http://localhost:5000`

2. **Start the web frontend (in another terminal):**
   ```bash
   cd client
   npm start
   ```
   Frontend will run on `http://localhost:3000`

3. **Start the mobile app (optional, in another terminal):**
   ```bash
   cd mobile
   npx expo start
   ```
   - Install "Expo Go" app on your phone
   - Scan the QR code to run the mobile app
   - See `mobile/README.md` for detailed mobile setup

4. **Access the applications:**
   - **Web**: Open your browser to `http://localhost:3000`
   - **Mobile**: Use Expo Go app to scan QR code
   - Register a new account or login on either platform

## 📱 Usage Guide

### Authentication
1. **Register**: Create a new account with name, email, and password
2. **Login**: Sign in with your credentials
3. **Protected Access**: Only authenticated users can access the dashboard

### Task Management
1. **Create Tasks**: Click "Add Task" to create new tasks with:
   - Title and description
   - Subject and task type
   - Due date and time
   - Priority level (low, medium, high)
   - Estimated hours

2. **Manage Tasks**: 
   - Click status icon to cycle through: pending → in-progress → completed
   - Edit tasks by clicking the edit button
   - Delete tasks with confirmation
   - Filter tasks by status
   - Sort by due date, priority, or subject

3. **Calendar View**:
   - Visual heatmap showing task density by date
   - Click dates to see tasks for that day
   - Navigate between months
   - Color intensity indicates task load

### Dashboard Features
- **Statistics Cards**: Overview of completed, due today, and overdue tasks
- **Tabbed Interface**: Switch between Tasks, Calendar, and Statistics views
- **Real-time Updates**: All changes reflect immediately across the application

### Sprint 2 Features Usage

#### New Home Page
- **Landing Experience**: Modern Todoist-inspired design with clear value proposition
- **Call-to-Action**: Prominent signup/login buttons for easy user onboarding
- **Feature Showcase**: Visual demonstration of task heatmap and benefits
- **Social Proof**: User counter and testimonials to build trust

#### Notifications System
- **Web Notifications**: Bell icon in navigation shows unread count
- **Notification Dropdown**: Click bell to see recent notifications with mark-as-read functionality
- **Mobile Push Notifications**: Native push notifications for due date reminders
- **Smart Reminders**: Automatic notifications 24 hours before due date, 2 hours before due time, and for overdue tasks

#### Rich Notes System
- **Task-Linked Notes**: Each task can have multiple rich-text notes
- **Markdown Support**: Full Markdown editing with live preview
- **Template System**: Pre-built templates (Lab Report, Exam Revision, Reading Summary, Essay Outline)
- **Web Notes Interface**: Dual-pane layout with notes list and editor
- **Mobile Notes Panel**: Slide-up modal with full Markdown editing capabilities
- **Real-time Sync**: Notes automatically sync between web and mobile every 30 seconds

## 🎨 UI/UX Features

- **Modern Design**: Clean, glass-morphism inspired interface
- **Responsive Layout**: Works on desktop and mobile devices
- **Interactive Elements**: Hover effects and smooth transitions
- **Color Coding**: 
  - Priority levels (red=high, yellow=medium, green=low)
  - Task types (different background colors)
  - Status indicators (pending, in-progress, completed)
- **Toast Notifications**: Success and error messages for user actions

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Tasks
- `GET /api/tasks` - Get user's tasks (with filtering)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/calendar` - Get tasks for calendar (grouped by date)

### Notes (Sprint 2)
- `GET /api/notes` - Get all user notes (with sync support via `since` parameter)
- `POST /api/notes` - Create new note linked to a task
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note content
- `DELETE /api/notes/:id` - Delete note
- `GET /api/notes/task/:taskId` - Get all notes for a specific task
- `GET /api/notes/templates` - Get available note templates

### Notifications (Sprint 2)
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create new notification
- `PUT /api/notifications/:id` - Update notification (mark as read)
- `DELETE /api/notifications/:id` - Delete notification
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **Protected Routes**: Middleware ensures authenticated access
- **CORS Configuration**: Controlled cross-origin requests

## 📊 Data Models

### User Schema
- `name`: String (required, 2-50 characters)
- `email`: String (required, unique, validated)
- `password`: String (required, min 6 characters, hashed)
- `createdAt`: Date (auto-generated)

### Task Schema
- `title`: String (required, max 100 characters)
- `description`: String (optional, max 500 characters)
- `subject`: String (required, max 50 characters)
- `type`: Enum (assignment, exam, project, reading, other)
- `priority`: Enum (low, medium, high)
- `status`: Enum (pending, in-progress, completed)
- `dueDate`: Date (required)
- `dueTime`: String (default: "23:59")
- `estimatedHours`: Number (0.5-100, default: 1)
- `user`: ObjectId (reference to User)
- `createdAt`/`updatedAt`: Dates (auto-managed)

### Note Schema (Sprint 2)
- `title`: String (required, max 200 characters)
- `content`: String (supports Markdown, max 10,000 characters)
- `template`: String (template used for creation)
- `tags`: Array of Strings (for categorization)
- `task`: ObjectId (reference to Task)
- `user`: ObjectId (reference to User)
- `createdAt`/`updatedAt`: Dates (auto-managed)

### Notification Schema (Sprint 2)
- `title`: String (required, notification title)
- `message`: String (required, notification content)
- `type`: Enum (task_due, task_overdue, task_completed, system)
- `isRead`: Boolean (default: false)
- `data`: Object (additional notification data)
- `user`: ObjectId (reference to User)
- `createdAt`/`updatedAt`: Dates (auto-managed)

## 🎯 Week 2 & 3 Completion Checklist

### Week 2 - Authentication & Database ✅
- [x] MongoDB User collection established
- [x] User registration with validation
- [x] Secure login with JWT tokens
- [x] Protected "who-am-I" endpoint
- [x] Frontend authentication flow
- [x] Protected dashboard access

### Week 3 - Task Management & Calendar ✅
- [x] Task schema with all required fields
- [x] Complete CRUD operations for tasks
- [x] Task filtering and sorting
- [x] Calendar view with task visualization
- [x] Heatmap showing task density
- [x] Interactive date selection
- [x] Real-time task status updates

## 🚧 Future Enhancements (Week 4+)

The foundation is now ready for upcoming features:
- **Week 4**: AI Assistant integration with OpenAI API
- **Week 5**: Import/Export functionality (.ics/.json)
- **Week 6**: Statistics, progress tracking, and gamification
- **Week 7**: Mobile responsiveness and performance optimization
- **Week 8**: Final polishing and deployment

## 🤝 Team

**LahoumaBarik Team:**
- Mohammed Ali Atmani
- Mazguene Lyna  
- Rihame Allali

## 📞 Support

If you encounter any issues:
1. Check that MongoDB is running
2. Ensure both servers are started
3. Verify environment variables are set correctly
4. Check the browser console and server logs for error messages

## 📱 Mobile App

In addition to the web version, SchoolBag now includes a **React Native mobile app** with full feature parity:

### Mobile Features
- **Cross-platform**: Works on both iOS and Android
- **Same backend**: Shares data with the web version
- **Native UI**: Optimized for mobile with native navigation
- **Offline-ready**: AsyncStorage for persistent login
- **Touch-optimized**: Mobile-first design patterns

### Mobile Setup
1. Follow the installation steps above for mobile dependencies
2. Update the API URL in `mobile/src/context/AuthContext.js` with your computer's IP
3. Start the Expo development server: `npx expo start`
4. Use Expo Go app to scan QR code and test on your device

For detailed mobile setup instructions, see `mobile/README.md`.

---

**Status**: ✅ Week 2, 3 & Sprint 2 Complete - Full-featured academic task management with authentication, calendar visualization, notifications, rich notes, and cross-platform sync functionality! 