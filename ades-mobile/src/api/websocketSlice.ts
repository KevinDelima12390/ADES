import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WebSocketState {
  isConnected: boolean;
  message: string | null;
  error: string | null;
}

const initialState: WebSocketState = {
  isConnected: false,
  message: null,
  error: null,
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    connectionEstablished(state) {
      state.isConnected = true;
      state.error = null;
    },
    connectionClosed(state) {
      state.isConnected = false;
    },
    connectionError(state, action: PayloadAction<string>) {
      state.isConnected = false;
      state.error = action.payload;
    },
    messageReceived(state, action: PayloadAction<string>) {
      state.message = action.payload;
    },
  },
});

export const {
  connectionEstablished,
  connectionClosed,
  connectionError,
  messageReceived,
} = websocketSlice.actions;

export default websocketSlice.reducer;
