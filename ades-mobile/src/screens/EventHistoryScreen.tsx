import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import { RootState } from '../store';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  EventHistory: undefined;
};

type EventHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EventHistory'>;

interface EventHistoryScreenProps {
  navigation: EventHistoryScreenNavigationProp;
}

interface Event {
  id: number;
  triggered_at: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'in-progress' | 'resolved';
}

const EventHistoryScreen: React.FC<EventHistoryScreenProps> = ({ navigation }) => {
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
      Toast.show({ type: 'success', text1: 'Event history loaded.' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch event history.');
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to fetch event history.' });
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
        return '#ffc107'; // yellow
      case 'in-progress':
        return '#17a2b8'; // info blue
      case 'resolved':
        return '#28a745'; // green
      default:
        return '#6c757d'; // grey
    }
  };

  const formatTimestamp = (triggered_at: string) => {
    return new Date(triggered_at).toLocaleString();
  };

  const handleCoordinateClick = (lat: number, lon: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    Linking.openURL(url);
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <View style={styles.eventCard}>
      <Text style={styles.eventText}>Date/Time: {formatTimestamp(item.triggered_at)}</Text>
      <View style={styles.coordsContainer}>
        <Text style={styles.eventText}>Latitude: </Text>
        <TouchableOpacity onPress={() => handleCoordinateClick(item.latitude, item.longitude)}>
          <Text style={styles.coordLink}>{item.latitude.toFixed(4)}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.coordsContainer}>
        <Text style={styles.eventText}>Longitude: </Text>
        <TouchableOpacity onPress={() => handleCoordinateClick(item.latitude, item.longitude)}>
          <Text style={styles.coordLink}>{item.longitude.toFixed(4)}</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.eventText, { color: getStatusColor(item.status) }]}>Status: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event History</Text>
      <TouchableOpacity style={styles.refreshButton} onPress={fetchEvents} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.refreshButtonText}>Refresh Events</Text>}
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>
          Error: {error}
        </Text>
      )}

      {!loading && events.length === 0 && !error && (
        <Text style={styles.noEventsText}>
          No events found for your user ID.
        </Text>
      )}

      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEventItem}
        contentContainerStyle={styles.listContent}
      />
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
    marginBottom: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  noEventsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventText: {
    fontSize: 16,
    marginBottom: 5,
  },
  coordsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  coordLink: {
    color: '#007bff',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});

export default EventHistoryScreen;
