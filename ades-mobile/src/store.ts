import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import websocketReducer from './api/websocketSlice';
import websocketMiddleware from './api/websocketMiddleware';

const store = configureStore({
  reducer: {
    auth: authReducer,
    websocket: websocketReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(websocketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
