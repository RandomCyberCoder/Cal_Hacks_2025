import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { logsAPI } from '@/services/api';
import { locationService, AddressComponents } from '@/services/locationService';

interface LogEntry {
  _id: string;
  timestamp: string;
  Note: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  address?: AddressComponents; // Added for geocoded address
}

export default function LogsScreen() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await logsAPI.getLogs();
      if (response.success) {
        // Sort by timestamp (newest first)
        const sortedLogs = response.events.sort((a: LogEntry, b: LogEntry) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        // Load addresses for each log entry
        const logsWithAddresses = await Promise.all(
          sortedLogs.map(async (log: LogEntry) => {
            const [longitude, latitude] = log.location.coordinates;
            const address = await locationService.reverseGeocode(latitude, longitude);
            return { ...log, address };
          })
        );
        
        setLogs(logsWithAddresses);
      } else {
        Alert.alert('Error', 'Failed to load logs');
      }
    } catch (error) {
      console.error('Load logs error:', error);
      Alert.alert('Error', 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatLocation = (coordinates: [number, number]) => {
    const [longitude, latitude] = coordinates;
    return {
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6)
    };
  };

  const openMaps = (coordinates: [number, number]) => {
    const [longitude, latitude] = coordinates;
    const url = `https://maps.google.com/?q=${latitude},${longitude}`;
    // You can implement map opening logic here
    Alert.alert('Location', `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
  };

  const getCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      const location = await locationService.getCurrentLocation();
      
      if (location) {
        const address = await locationService.reverseGeocode(location.latitude, location.longitude);
        const addressText = address?.formattedAddress || 
          `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
        
        Alert.alert(
          'Current Location',
          `📍 ${addressText}`,
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'Add as Log', 
              style: 'default',
              onPress: () => addCurrentLocationLog(location, address)
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Could not get current location');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setGettingLocation(false);
    }
  };

  const addCurrentLocationLog = async (location: { latitude: number; longitude: number }, address: AddressComponents | null) => {
    try {
      const newLog = {
        timestamp: new Date().toISOString(),
        Note: `Current location: ${address?.formattedAddress || 'Unknown address'}`,
        location: {
          coordinates: [location.longitude, location.latitude] as [number, number]
        }
      };

      const response = await logsAPI.addLog(newLog);
      if (response.success) {
        Alert.alert('Success', 'Location added to logs!');
        loadLogs(); // Refresh logs
      } else {
        Alert.alert('Error', 'Failed to add location to logs');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add location to logs');
    }
  };

  const renderLogEntry = ({ item }: { item: LogEntry }) => {
    const { date, time } = formatTimestamp(item.timestamp);
    const { latitude, longitude } = formatLocation(item.location.coordinates);

    return (
      <View style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={styles.timestampContainer}>
            <Ionicons name="time-outline" size={16} color="#8b6f47" />
            <Text style={styles.dateText}>{date}</Text>
            <Text style={styles.timeText}>{time}</Text>
          </View>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={() => openMaps(item.location.coordinates)}
          >
            <Ionicons name="location-outline" size={16} color="#8b6f47" />
          </TouchableOpacity>
        </View>

        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptLabel}>Transcript:</Text>
          <Text style={styles.transcriptText}>
            {item.Note || 'No transcript available'}
          </Text>
        </View>

        <View style={styles.locationContainer}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Location:</Text>
            {item.address?.formattedAddress ? (
              <View>
                <Text style={styles.addressText}>
                  📍 {item.address.formattedAddress}
                </Text>
                <Text style={styles.coordinatesText}>
                  {latitude}, {longitude}
                </Text>
              </View>
            ) : (
              <Text style={styles.locationCoordinates}>
                📍 {latitude}, {longitude}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Event Logs
        </ThemedText>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.locationButton} 
            onPress={getCurrentLocation}
            disabled={gettingLocation}
          >
            {gettingLocation ? (
              <ActivityIndicator size="small" color="#8b6f47" />
            ) : (
              <Ionicons name="location" size={24} color="#8b6f47" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={loadLogs}>
            <Ionicons name="refresh" size={24} color="#8b6f47" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.logCount}>
        {logs.length} log{logs.length !== 1 ? 's' : ''} found
      </Text>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b6f47" />
            <Text style={styles.loadingText}>Loading logs...</Text>
          </View>
        ) : logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No logs yet</Text>
            <Text style={styles.emptySubtitle}>Event logs will appear here when available</Text>
          </View>
        ) : (
          <FlatList
            data={logs}
            renderItem={renderLogEntry}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5dc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5dc',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e6dcc6',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8b6f47',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    marginLeft: 8,
  },
  logCount: {
    fontSize: 16,
    color: '#a0845c',
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8b6f47',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b6f47',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#a0845c',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  logCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#8b6f47',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e6dcc6',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b6f47',
    marginLeft: 8,
    marginRight: 12,
  },
  timeText: {
    fontSize: 14,
    color: '#a0845c',
  },
  locationButton: {
    padding: 4,
    backgroundColor: '#f9f7f1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6dcc6',
  },
  transcriptContainer: {
    marginBottom: 16,
  },
  transcriptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b6f47',
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    backgroundColor: '#f9f7f1',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6dcc6',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b6f47',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#a0845c',
    fontFamily: 'monospace',
  },
  locationCoordinates: {
    fontSize: 14,
    color: '#a0845c',
    fontFamily: 'monospace',
  },
});
