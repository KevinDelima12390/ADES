import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  userId: string | null;
}

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  userId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; userId: string }>) => {
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.isAuthenticated = true;
      SecureStore.setItemAsync('jwtToken', action.payload.token);
      SecureStore.setItemAsync('userId', action.payload.userId);
    },
    logout: (state) => {
      state.token = null;
      state.userId = null;
      state.isAuthenticated = false;
      SecureStore.deleteItemAsync('jwtToken');
      SecureStore.deleteItemAsync('userId');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
