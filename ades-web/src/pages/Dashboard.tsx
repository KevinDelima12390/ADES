import React, { useState, useRef, useEffect } from 'react';
import { Button, Container, Typography, Box, CircularProgress, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../auth/authSlice';
import api from '../api/axios';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userId } = useSelector((state: RootState) => state.auth);

  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationError(null);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('User denied the request for Geolocation.');
            toast.error('Geolocation permission denied. Please enable it in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            toast.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('The request to get user location timed out.');
            toast.error('The request to get user location timed out.');
            break;
          default:
            setLocationError('An unknown error occurred.');
            toast.error('An unknown error occurred.');
            break;
        }
      }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const startHold = () => {
    setIsHolding(true);
    setHoldProgress(0);
    intervalRef.current = window.setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(intervalRef.current!); // Clear interval when 100% reached
          return 100;
        }
        return prev + (100 / 30); // 30 frames for 3 seconds (1000ms / 100ms interval = 10, 3s * 10 = 30)
      });
    }, 100);

    holdTimerRef.current = window.setTimeout(() => {
      setIsHolding(false);
      window.clearInterval(intervalRef.current!); // Ensure interval is cleared
      handleEmergencyTrigger();
    }, 3000);
  };

  const endHold = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  const handleEmergencyTrigger = async () => {
    if (!userId) {
      toast.error('User not logged in.');
      navigate('/login');
      return;
    }
    if (locationError) {
      toast.error(`Cannot send emergency: ${locationError}`);
      return;
    }
    if (latitude === null || longitude === null) {
      toast.error('Waiting for location data. Please try again.');
      getUserLocation(); // Try to get location again
      return;
    }

    try {
      await api.post('/emergency', {
        user_id: userId,
        latitude,
        longitude,
      });
      toast.success('Emergency signal sent. Help is on the way.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send emergency signal.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    sessionStorage.removeItem('jwtToken');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('userId');
    dispatch(logout());
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Typography component="h1" variant="h4">
          Welcome, {userId}!
        </Typography>

        <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%' }}>
          <Typography variant="h6">Emergency Trigger</Typography>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={holdProgress}
              size={200}
              thickness={4}
              sx={{
                color: 'red',
                position: 'absolute',
                left: 0,
              }}
            />
            <Button
              variant="contained"
              color="error"
              sx={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                fontSize: '2rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseDown={startHold}
              onMouseUp={endHold}
              onMouseLeave={endHold} // In case mouse leaves button while holding
              onTouchStart={startHold}
              onTouchEnd={endHold}
              onTouchCancel={endHold}
              disabled={isHolding || !!locationError || latitude === null}
            >
              EMERGENCY
            </Button>
          </Box>
          <Typography variant="body1">
            {isHolding ? `Holding... ${Math.ceil(3 - (holdProgress / 100) * 3)}s` : 'Hold for 3 seconds to confirm.'}
          </Typography>
          {locationError && (
            <Typography color="error" variant="body2">
              Location Error: {locationError}
            </Typography>
          )}
          {latitude === null && !locationError && (
            <Typography variant="body2" color="textSecondary">
              Fetching location...
            </Typography>
          )}
        </Paper>

        <Button variant="outlined" onClick={() => navigate('/events')} sx={{ mt: 2 }}>
          View Event History
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleLogout} sx={{ mt: 2 }}>
          Logout
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard;