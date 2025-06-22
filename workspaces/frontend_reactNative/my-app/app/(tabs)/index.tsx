import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { vapiAPI } from '@/services/api';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [isCallLoading, setIsCallLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleMakeCall = async () => {
    Alert.alert(
      'Make Emergency Call',
      'Are you sure you want to make a call to +19167087169?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', style: 'default', onPress: async () => {
          try {
            setIsCallLoading(true);
            const response = await vapiAPI.makeCall('+19167087169'); // Using the correct 916 number
            
            if (response.success) {
              Alert.alert('Success', `Call initiated successfully!\nCall ID: ${response.callId}`);
            } else {
              Alert.alert('Error', response.error || 'Failed to make call');
            }
          } catch (error) {
            console.error('Call error:', error);
            Alert.alert('Error', 'Failed to make call. Please try again.');
          } finally {
            setIsCallLoading(false);
          }
        }},
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title" style={styles.title}>
            Welcome back!
          </ThemedText>
          <ThemedText type="default" style={styles.subtitle}>
            Hello, {user?.userName}
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#8b6f47" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Emergency Call Button */}
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={handleMakeCall}
          disabled={isCallLoading}
        >
          {isCallLoading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <>
              <Ionicons name="call" size={48} color="white" style={styles.callIcon} />
              <Text style={styles.emergencyButtonText}>Emergency Call</Text>
              <Text style={styles.emergencySubtext}>+1 (916) 708-7169</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.card}>
          <Ionicons name="person-circle-outline" size={48} color="#8b6f47" style={styles.cardIcon} />
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Your Profile
          </ThemedText>
          <ThemedText type="default" style={styles.cardDescription}>
            Username: {user?.userName}
          </ThemedText>
          <ThemedText type="default" style={styles.cardDescription}>
            User ID: {user?.id}
          </ThemedText>
        </View>

        <View style={styles.card}>
          <Ionicons name="calendar-outline" size={48} color="#a0845c" style={styles.cardIcon} />
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Events
          </ThemedText>
          <ThemedText type="default" style={styles.cardDescription}>
            Manage your events and schedule
          </ThemedText>
        </View>

        <View style={styles.card}>
          <Ionicons name="location-outline" size={48} color="#b8956d" style={styles.cardIcon} />
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Zones
          </ThemedText>
          <ThemedText type="default" style={styles.cardDescription}>
            Configure your location zones
          </ThemedText>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusDot} />
          <ThemedText type="default" style={styles.statusText}>
            Successfully authenticated with MongoDB
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5dc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#8b6f47',
  },
  subtitle: {
    fontSize: 16,
    color: '#a0845c',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  emergencyButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    minHeight: 120,
  },
  callIcon: {
    marginBottom: 8,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emergencySubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
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
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#8b6f47',
  },
  cardDescription: {
    fontSize: 14,
    color: '#a0845c',
    textAlign: 'center',
    lineHeight: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f7f1',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e6dcc6',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8b6f47',
    marginRight: 12,
  },
  statusText: {
    color: '#8b6f47',
    fontSize: 14,
    fontWeight: '500',
  },
});
