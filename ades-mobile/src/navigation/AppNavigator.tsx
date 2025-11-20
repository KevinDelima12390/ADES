import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import * as SecureStore from 'expo-secure-store';

import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EventHistoryScreen from '../screens/EventHistoryScreen';
import { RootState } from '../store';
import { setCredentials } from '../auth/authSlice';

// Define types for each stack
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type AppStackParamList = {
  Dashboard: undefined;
  EventHistory: undefined;
};

const AuthStack = createStackNavigator<AuthStackParamList>();
const AppStack = createStackNavigator<AppStackParamList>();

const AuthStackNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegistrationScreen} />
  </AuthStack.Navigator>
);

const AppStackNavigator = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen name="Dashboard" component={DashboardScreen} />
    <AppStack.Screen name="EventHistory" component={EventHistoryScreen} />
  </AppStack.Navigator>
);

const AppNavigator = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadCredentials = async () => {
      const token = await SecureStore.getItemAsync('jwtToken');
      const userId = await SecureStore.getItemAsync('userId');
      if (token && userId) {
        dispatch(setCredentials({ token, userId }));
      }
    };
    loadCredentials();
  }, [dispatch]);

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStackNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;