import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import { useSelector, useDispatch } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';

import api from '../api/axios';
import { RootState } from '../store';
import { logout } from '../auth/authSlice';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  EventHistory: undefined;
};

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { userId } = useSelector((state: RootState) => state.auth);
  const { isConnected, message } = useSelector((state: RootState) => state.websocket);

  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  useEffect(() => {
    if (message) {
      try {
        const parsedMessage = JSON.parse(message);
        const alertMessage = parsedMessage.message || 'New alert received';
        Toast.show({
          type: 'info',
          text1: 'Real-Time Alert',
          text2: alertMessage,
          visibilityTime: 5000,
        });
      } catch (e) {
        // If message is not a JSON string, show it directly
        Toast.show({
          type: 'info',
          text1: 'Real-Time Alert',
          text2: message,
          visibilityTime: 5000,
        });
      }
    }
  }, [message]);


  const getUserLocation = async () => {
    setIsLocationLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationError('Permission to access location was denied.');
      Toast.show({ type: 'error', text1: 'Location permission denied.' });
      setIsLocationLoading(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      setLocationError(null);
    } catch (error: any) {
      setLocationError('Location information is unavailable.');
      Toast.show({ type: 'error', text1: 'Location information is unavailable.' });
    } finally {
      setIsLocationLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const startHold = () => {
    if (isLocationLoading || locationError || latitude === null) {
      Toast.show({ type: 'error', text1: 'Cannot trigger emergency. Waiting for location or resolving error.' });
      getUserLocation(); // Try to get location again
      return;
    }

    setIsHolding(true);
    setHoldProgress(0);
    intervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current!); // Clear interval when 100% reached
          return 100;
        }
        return prev + (100 / 30); // 30 frames for 3 seconds (1000ms / 100ms interval = 10, 3s * 10 = 30)
      });
    }, 100);

    holdTimerRef.current = setTimeout(() => {
      setIsHolding(false);
      clearInterval(intervalRef.current!); // Ensure interval is cleared
      handleEmergencyTrigger();
    }, 3000);
  };

  const endHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  const handleEmergencyTrigger = async () => {
    if (!userId) {
      Toast.show({ type: 'error', text1: 'User not logged in.' });
      navigation.navigate('Login');
      return;
    }
    if (locationError) {
      Toast.show({ type: 'error', text1: `Cannot send emergency: ${locationError}` });
      return;
    }
    if (latitude === null || longitude === null) {
      Toast.show({ type: 'error', text1: 'Waiting for location data. Please try again.' });
      getUserLocation(); // Try to get location again
      return;
    }

    try {
      await api.post('/emergency', {
        user_id: userId,
        latitude,
        longitude,
      });
      Toast.show({ type: 'success', text1: 'Emergency signal sent. Help is on the way.' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Failed to send emergency signal.' });
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('jwtToken');
    await SecureStore.deleteItemAsync('userId');
    dispatch(logout());
    Toast.show({ type: 'success', text1: 'Logged out successfully.' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {userId}!</Text>

      <View style={styles.emergencyContainer}>
        <TouchableOpacity
          style={[styles.emergencyButton, isHolding && styles.emergencyButtonHolding]}
          onPressIn={startHold}
          onPressOut={endHold}
          disabled={isHolding || isLocationLoading || !!locationError || latitude === null}
        >
          {isHolding ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Text style={styles.emergencyButtonText}>EMERGENCY</Text>
          )}
        </TouchableOpacity>
        {isHolding && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${holdProgress}%` }]} />
          </View>
        )}
        <Text style={styles.holdText}>
          {isHolding ? `Holding... ${Math.ceil(3 - (holdProgress / 100) * 3)}s` : 'Hold for 3 seconds to confirm.'}
        </Text>
        {isLocationLoading && <Text style={styles.locationStatusText}>Fetching location...</Text>}
        {locationError && <Text style={styles.errorText}>Location Error: {locationError}</Text>}
      </View>

      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('EventHistory')}>
        <Text style={styles.navButtonText}>View Event History</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.navButton, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.navButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.websocketStatusContainer}>
        <Text style={styles.websocketStatusText}>
          WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  emergencyContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  emergencyButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emergencyButtonHolding: {
    opacity: 0.7,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: 200,
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'green',
  },
  holdText: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },
  locationStatusText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    textAlign: 'center',
  },
  navButton: {
    width: '80%',
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  navButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  websocketStatusContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    alignItems: 'center',
  },
  websocketStatusText: {
    fontSize: 12,
    color: '#888',
  },
});

export default DashboardScreen;
