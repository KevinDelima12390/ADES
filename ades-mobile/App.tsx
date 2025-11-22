import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import store from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { wsConnect } from './src/api/websocketMiddleware';
import { AppDispatch } from './src/store';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View } from 'react-native';

const WEBSOCKET_ENDPOINT = 'ws://3.25.229.21:8000/ws/arc_engine';

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();

  const [fontsLoaded] = useFonts({
    'CustomFont-Regular': require('./assets/fonts/CustomFont-Regular.ttf'),
    'CustomFont-Bold': require('./assets/fonts/CustomFont-Bold.ttf'),
  });

  useEffect(() => {
    dispatch(wsConnect(WEBSOCKET_ENDPOINT));
  }, [dispatch]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
