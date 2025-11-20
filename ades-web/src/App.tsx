import { Routes, Route, Navigate } from 'react-router-dom';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import EventHistoryPage from './pages/EventHistoryPage';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { setCredentials } from './auth/authSlice';

function App() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (token && userId) {
      dispatch(setCredentials({ token, userId }));
    }
  }, [dispatch]);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        {isAuthenticated ? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<EventHistoryPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </>
  );
}

export default App;