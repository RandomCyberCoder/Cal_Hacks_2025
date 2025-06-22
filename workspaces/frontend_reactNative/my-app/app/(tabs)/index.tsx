import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { vapiAPI, logsAPI, contactsAPI } from '@/services/api';
import { useRouter } from 'expo-router';

interface LogEntry {
  _id: string;
  timestamp: string;
  Note: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isCallLoading, setIsCallLoading] = useState(false);
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [contactsCount, setContactsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load recent logs
      const logsResponse = await logsAPI.getLogs();
      if (logsResponse.success) {
        setRecentLogs(logsResponse.events.slice(0, 3)); // Get last 3 logs
      }

      // Load contacts count
      const contactsResponse = await contactsAPI.getContacts();
      if (contactsResponse.success) {
        setContactsCount(contactsResponse.contacts.length);
      }
    } catch (error) {
      console.error('Dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

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
      'Are you sure you want to make a call to +13052408589?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', style: 'default', onPress: async () => {
          try {
            setIsCallLoading(true);
            const response = await vapiAPI.makeCall('+13052408589');
            
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title" style={styles.greeting}>
              {getGreeting()}, {user?.userName}!
            </ThemedText>
            <ThemedText type="default" style={styles.subtitle}>
              Your safety companion is active
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={handleLogout}>
            <Ionicons name="settings-outline" size={24} color="#8b6f47" />
          </TouchableOpacity>
        </View>

        {/* Safety Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusContent}>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDotOuter}>
                <View style={styles.statusDotInner} />
              </View>
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>All Systems Active</Text>
              <Text style={styles.statusSubtitle}>Emergency services ready</Text>
            </View>
          </View>
        </View>

        {/* Emergency Call Button */}
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={handleMakeCall}
          disabled={isCallLoading}
        >
          {isCallLoading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <View style={styles.emergencyContent}>
              <View style={styles.emergencyIconContainer}>
                <Ionicons name="call" size={40} color="white" />
              </View>
              <View style={styles.emergencyTextContainer}>
                <Text style={styles.emergencyButtonText}>Emergency Call</Text>
                <Text style={styles.emergencySubtext}>Tap to call +1 (305) 240-8589</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.8)" />
            </View>
          )}
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={28} color="#8b6f47" />
            <Text style={styles.statNumber}>{contactsCount}</Text>
            <Text style={styles.statLabel}>Contacts</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="document-text-outline" size={28} color="#8b6f47" />
            <Text style={styles.statNumber}>{recentLogs.length}</Text>
            <Text style={styles.statLabel}>Recent Logs</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="location-outline" size={28} color="#8b6f47" />
            <Text style={styles.statNumber}>Active</Text>
            <Text style={styles.statLabel}>Location</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/contacts')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#e8f5e9' }]}>
              <Ionicons name="people" size={24} color="#4caf50" />
            </View>
            <Text style={styles.actionText}>Manage Contacts</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/logs')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#e3f2fd' }]}>
              <Ionicons name="document-text" size={24} color="#2196f3" />
            </View>
            <Text style={styles.actionText}>View Logs</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Coming Soon', 'Location zones feature coming soon!')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#fff3e0' }]}>
              <Ionicons name="location" size={24} color="#ff9800" />
            </View>
            <Text style={styles.actionText}>Set Zones</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Coming Soon', 'Profile settings coming soon!')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#f3e5f5' }]}>
              <Ionicons name="person" size={24} color="#9c27b0" />
            </View>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        {recentLogs.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => router.push('/logs')}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {recentLogs.map((log, index) => (
              <View key={log._id} style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Ionicons name="document-text-outline" size={20} color="#8b6f47" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText} numberOfLines={1}>
                    {log.Note || 'Activity logged'}
                  </Text>
                  <Text style={styles.activityTime}>{formatTime(log.timestamp)}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Motivational Quote */}
        <View style={styles.quoteCard}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#8b6f47" style={styles.quoteIcon} />
          <Text style={styles.quoteText}>
            "Your safety matters. We're here for you 24/7."
          </Text>
                 </View>
       </ScrollView>
     </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5dc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#8b6f47',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0845c',
  },
  settingsButton: {
    padding: 8,
  },
  statusCard: {
    backgroundColor: '#e8f5e9',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    marginRight: 12,
  },
  statusDotOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4caf50',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#558b2f',
  },
  emergencyButton: {
    backgroundColor: '#d32f2f',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emergencyTextContainer: {
    flex: 1,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emergencySubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6dcc6',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b6f47',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#a0845c',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8b6f47',
  },
  seeAllText: {
    fontSize: 14,
    color: '#b8956d',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6dcc6',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#8b6f47',
    fontWeight: '500',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e6dcc6',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f9f7f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#a0845c',
  },
  quoteCard: {
    backgroundColor: '#f9f7f1',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e6dcc6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  quoteIcon: {
    marginRight: 12,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    color: '#8b6f47',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
