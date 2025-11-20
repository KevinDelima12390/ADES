import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface Event {
  id: number;
  triggered_at: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'in-progress' | 'resolved';
}

const EventHistoryPage: React.FC = () => {
  const { userId } = useSelector((state: RootState) => state.auth);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!userId) {
      setError('User ID not found. Please log in.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/events/${userId}`);
      setEvents(response.data);
      toast.success('Event history loaded.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch event history.');
      toast.error(err.response?.data?.message || 'Failed to fetch event history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [userId]);

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'in-progress':
        return 'info';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (triggered_at: string) => {
    return new Date(triggered_at).toLocaleString();
  };

  const handleCoordinateClick = (lat: number, lon: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`, '_blank');
  };

  return (
    <Container component="main" maxWidth="md">
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
          Event History
        </Typography>
        <Button variant="contained" onClick={fetchEvents} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Refresh Events'}
        </Button>

        {error && (
          <Typography color="error" variant="body1">
            Error: {error}
          </Typography>
        )}

        {!loading && events.length === 0 && !error && (
          <Typography variant="body1">
            No events found for your user ID.
          </Typography>
        )}

        {!loading && events.length > 0 && (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="event history table">
              <TableHead>
                <TableRow>
                  <TableCell>Date/Time</TableCell>
                  <TableCell align="right">Latitude</TableCell>
                  <TableCell align="right">Longitude</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow
                    key={event.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {formatTimestamp(event.triggered_at)}
                    </TableCell>
                    <TableCell align="right">
                      <Button onClick={() => handleCoordinateClick(event.latitude, event.longitude)}>
                        {event.latitude.toFixed(4)}
                      </Button>
                    </TableCell>
                    <TableCell align="right">
                      <Button onClick={() => handleCoordinateClick(event.latitude, event.longitude)}>
                        {event.longitude.toFixed(4)}
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={event.status} color={getStatusColor(event.status)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default EventHistoryPage;