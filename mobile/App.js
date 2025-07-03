import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { TaskProvider } from './src/context/TaskContext';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TasksScreen from './src/screens/TasksScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Auth Stack (Login/Register)
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Main App Tabs
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        
        if (route.name === 'Tasks') {
          iconName = focused ? 'list' : 'list-outline';
        } else if (route.name === 'Calendar') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#667eea',
      tabBarInactiveTintColor: 'gray',
      headerStyle: {
        backgroundColor: '#667eea',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <Tab.Screen 
      name="Tasks" 
      component={TasksScreen} 
      options={{ title: 'My Tasks' }}
    />
    <Tab.Screen 
      name="Calendar" 
      component={CalendarScreen} 
      options={{ title: 'Calendar' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

// App Content with Auth Check
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // You could add a loading screen here
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

// Main App Component
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TaskProvider>
          <AppContent />
          <StatusBar style="auto" />
        </TaskProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
