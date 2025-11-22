import { Middleware } from '@reduxjs/toolkit';
import {
  connectionEstablished,
  connectionClosed,
  connectionError,
  messageReceived,
} from './websocketSlice';

const WEBSOCKET_ENDPOINT = 'ws://3.25.229.21:8000/ws/arc_engine';

export const wsConnect = (host: string) => ({ type: 'WS_CONNECT', payload: host });
export const wsDisconnect = () => ({ type: 'WS_DISCONNECT' });

const websocketMiddleware: Middleware = store => {
  let socket: WebSocket | null = null;

  return next => action => {
    switch (action.type) {
      case 'WS_CONNECT':
        if (socket !== null) {
          socket.close();
        }

        socket = new WebSocket(action.payload);

        socket.onopen = () => {
          store.dispatch(connectionEstablished());
        };

        socket.onmessage = event => {
          // Assuming the message data is a simple string.
          // If it's JSON, you would use JSON.parse(event.data)
          store.dispatch(messageReceived(event.data));
        };

        socket.onclose = () => {
          store.dispatch(connectionClosed());
        };

        socket.onerror = event => {
          // The error event itself is not very descriptive.
          // You might want to dispatch a generic error message.
          store.dispatch(connectionError('WebSocket error'));
        };
        break;

      case 'WS_DISCONNECT':
        if (socket !== null) {
          socket.close();
        }
        socket = null;
        break;

      default:
        return next(action);
    }
  };
};

export default websocketMiddleware;
