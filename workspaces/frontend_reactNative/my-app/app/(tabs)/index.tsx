import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator, ScrollView, SafeAreaView, Modal, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { vapiAPI, logsAPI, contactsAPI } from '@/services/api';
import { locationService } from '@/services/locationService';
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

interface Contact {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  avatar: string;
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isCallLoading, setIsCallLoading] = useState(false);
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsCount, setContactsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number; address?: string} | null>(null);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);

  const VAPI_API_KEY = process.env.EXPO_PUBLIC_VAPI_API_KEY;

  useEffect(() => {
    loadDashboardData();
    getCurrentLocation();
  }, []); 

  const getCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        // Get address for better context
        const address = await locationService.reverseGeocode(location.latitude, location.longitude);
        setUserLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          address: address?.formattedAddress
        });
        console.log('Location obtained:', JSON.stringify({location, address: address?.formattedAddress}, null, 2));
      }
    } catch (error) {
      console.error('Location error:', JSON.stringify(error, null, 2));
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load recent logs
      const logsResponse = await logsAPI.getLogs();
      if (logsResponse.success) {
        setRecentLogs(logsResponse.events.slice(0, 3)); // Get last 3 logs
      }

      // Load contacts count and full contacts list
      const contactsResponse = await contactsAPI.getContacts();
      if (contactsResponse.success) {
        setContacts(contactsResponse.contacts);
        setContactsCount(contactsResponse.contacts.length);
      }
    } catch (error) {
      console.error('Dashboard data error:', JSON.stringify(error, null, 2));
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

  const handleMakeCall = async (
    phoneNumber?: string, 
    contactName?: string, 
    callType: 'general' | 'contact' | 'emergency' = 'general'
  ) => {
    const displayNumber = phoneNumber || '+13052408589';
    let callTypeDisplay = 'Assistant';
    
    switch(callType) {
      case 'contact':
        callTypeDisplay = contactName || 'Contact';
        break;
      case 'emergency':
        callTypeDisplay = '911 Emergency';
        break;
      case 'general':
      default:
        callTypeDisplay = 'Assistant';
    }
    
    Alert.alert(
      `Call ${callTypeDisplay}`,
      `Are you sure you want to make a call to ${displayNumber}?${userLocation ? '\n\n📍 Your location will be shared for assistance.' : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', style: 'default', onPress: async () => {
          try {
            setIsCallLoading(true);
            
            // Get fresh location if not available
            let currentLocation = userLocation;
            if (!currentLocation) {
              const location = await locationService.getCurrentLocation();
              if (location) {
                const address = await locationService.reverseGeocode(location.latitude, location.longitude);
                currentLocation = {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  address: address?.formattedAddress
                };
                setUserLocation(currentLocation);
              }
            }
            
            const response = await vapiAPI.makeCall(
              phoneNumber,
              callType,
              currentLocation || undefined,
              contactName
            );
            
            if (response.success) {
              console.log("📞 Call Response:", JSON.stringify(response, null, 2));
              
              // Store the call ID for later summary fetching
              setCurrentCallId(response.callId);
              
              Alert.alert(
                'Call Started', 
                `Call initiated successfully!\nCall ID: ${response.callId}\nAssistant Type: ${response.assistantType}${currentLocation ? `\nLocation: ${currentLocation.address || 'Coordinates shared'}` : ''}`,
                [
                  { 
                    text: 'Call Completed', 
                    onPress: async () => {
                      console.log('🔍 Fetching call summary...');
                      console.log('🔑 VAPI_API_KEY:', VAPI_API_KEY ? 'Present' : 'MISSING!');
                      
                      if (!VAPI_API_KEY) {
                        Alert.alert('Error', 'VAPI API key is missing. Please add EXPO_PUBLIC_VAPI_API_KEY to your .env file');
                        return;
                      }
                      
                      try {
                        // Fetch the actual call summary from VAPI
                        const callResponse = await fetch(`https://api.vapi.ai/call/${response.callId}`, {
                          headers: {
                            "Authorization": `Bearer ${VAPI_API_KEY}`,
                            "Content-Type": "application/json",
                          },
                        });
                        
                        if (callResponse.ok) {
                          const callData = await callResponse.json();
                          console.log('📞 Call Data:', JSON.stringify(callData, null, 2));
                          
                                                    // Extract summary/transcript
                          console.log('🔍 Raw VAPI Response Structure:');
                          console.log('📊 callData.analysis:', JSON.stringify(callData.analysis.summary, null, 2));
                          console.log('📝 callData.transcript:', JSON.stringify(callData.transcript, null, 2));
                          console.log('📋 callData.summary:', JSON.stringify(callData.summary, null, 2));
                          
                          const summary = callData.analysis?.summary?.notes || 
                                        JSON.stringify(callData.analysis?.summary) || 
                                        callData.transcript || 
                                        callData.summary ||
                                        `${callTypeDisplay} call completed`;
                          
                          console.log('✅ EXTRACTED SUMMARY:', JSON.stringify(summary, null, 2));
                          console.log('📏 Summary length:', summary.length);
                          console.log('🎯 Summary type:', typeof summary);
                          
                          // Create log entry with actual call summary
                          const logEntry = {
                            timestamp: new Date().toISOString(),
                            Note: summary,
                            location: {
                              coordinates: (currentLocation ? 
                                [currentLocation.longitude, currentLocation.latitude] : 
                                [-122.4194, 37.7749]) as [number, number]
                            }
                          };
                          
                          console.log('💾 SAVING TO MONGODB:', JSON.stringify(logEntry, null, 2));
                          
                          await logsAPI.addLog(logEntry);
                          console.log('✅ Log entry successfully saved to MongoDB!');
                          
                          // Show summary to user
                          Alert.alert(
                            'Call Summary Saved',
                            `Summary: ${summary.substring(0, 100)}${summary.length > 100 ? '...' : ''}`
                          );
                          
                        } else {
                          console.error('Failed to fetch call data:', callResponse.status);
                                                     // Fallback: create basic log entry
                          await logsAPI.addLog({
                            timestamp: new Date().toISOString(),
                            Note: `${callTypeDisplay} call completed`,
                            location: {
                              coordinates: (currentLocation ? 
                                [currentLocation.longitude, currentLocation.latitude] : 
                                [-122.4194, 37.7749]) as [number, number]
                            }
                          });
                          
                          Alert.alert('Call Completed', 'Call summary will be available shortly.');
                        }
                        
                        loadDashboardData(); // Refresh to show new log
                        
                      } catch (error) {
                        console.error('Failed to fetch call summary:', JSON.stringify(error, null, 2));
                        
                                                 // Fallback: create basic log entry
                        try {
                          await logsAPI.addLog({
                            timestamp: new Date().toISOString(),
                            Note: `${callTypeDisplay} call completed`,
                            location: {
                              coordinates: (currentLocation ? 
                                [currentLocation.longitude, currentLocation.latitude] : 
                                [-122.4194, 37.7749]) as [number, number]
                            }
                          });
                          loadDashboardData();
                          Alert.alert('Call Completed', 'Basic log entry created.');
                        } catch (logError) {
                          console.error('Failed to add fallback log entry:', JSON.stringify(logError, null, 2));
                          Alert.alert('Error', 'Failed to save call log.');
                        }
                      }
                    }
                  }
                ]
              );
            } else {
              Alert.alert('Error', response.error || 'Failed to make call');
            }
          } catch (error: any) {
            console.error('Call error:', JSON.stringify(error, null, 2));
            
            // Better error logging
            let errorMessage = 'Failed to make call. Please try again.';
            if (error.response) {
              // Server responded with error status
              console.error('Response error:', error.response.status, JSON.stringify(error.response.data, null, 2));
              errorMessage = `Server error (${error.response.status}): ${error.response.data?.error || error.response.data?.message || 'Unknown error'}`;
            } else if (error.request) {
              // Request made but no response
              console.error('Network error:', JSON.stringify(error.request, null, 2));
              errorMessage = 'Network error: Could not connect to server. Check if backend is running.';
            } else {
              // Something else
              console.error('Error message:', error.message);
              errorMessage = `Error: ${error.message}`;
            }
            
            Alert.alert('Call Failed', errorMessage);
          } finally {
            setIsCallLoading(false);
            setShowContactModal(false);
          }
        }},
      ]
    );
  };

  const handleContactAssistance = () => {
    if (contacts.length === 0) {
      Alert.alert(
        'No Contacts',
        'You haven\'t added any contacts yet. Would you like to add one now?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Contact', onPress: () => router.push('/contacts') },
        ]
      );
      return;
    }
    setShowContactModal(true);
  };

  const handle911Emergency = () => {
    Alert.alert(
      '🚨 Emergency Call',
      'This will call 911 emergency services. Only use in real emergencies.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 911', style: 'destructive', onPress: () => handleMakeCall('911', '911 Emergency', 'emergency') },
      ]
    );
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity 
      style={styles.contactModalItem}
      onPress={() => handleMakeCall(item.phoneNumber, item.name, 'contact')}
    >
      <Text style={styles.contactModalAvatar}>{item.avatar}</Text>
      <View style={styles.contactModalInfo}>
        <Text style={styles.contactModalName}>{item.name}</Text>
        <Text style={styles.contactModalPhone}>{item.phoneNumber}</Text>
      </View>
      <Ionicons name="call" size={20} color="#8b6f47" />
    </TouchableOpacity>
  );

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
              {userLocation && ' 📍'}
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
              <Text style={styles.statusSubtitle}>
                Emergency services ready{userLocation ? ' • Location tracked' : ' • Getting location...'}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Assistant Call Button */}
        <TouchableOpacity 
          style={styles.mainCallButton}
          onPress={() => handleMakeCall(undefined, undefined, 'general')}
          disabled={isCallLoading}
        >
          {isCallLoading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <View style={styles.mainCallContent}>
              <View style={styles.mainCallIconContainer}>
                <Ionicons name="headset" size={40} color="white" />
              </View>
              <View style={styles.mainCallTextContainer}>
                <Text style={styles.mainCallButtonText}>Call Assistant</Text>
                <Text style={styles.mainCallSubtext}>Get help with anything</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.8)" />
            </View>
          )}
        </TouchableOpacity>

        {/* Assistance Buttons */}
        <View style={styles.assistanceContainer}>
          <TouchableOpacity 
            style={styles.assistanceButton}
            onPress={handleContactAssistance}
            disabled={isCallLoading}
          >
            <View style={styles.assistanceContent}>
              <View style={[styles.assistanceIconContainer, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="people" size={28} color="white" />
              </View>
              <View style={styles.assistanceTextContainer}>
                <Text style={styles.assistanceButtonText}>Call Contact</Text>
                <Text style={styles.assistanceSubtext}>Reach saved contact</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.assistanceButton}
            onPress={handle911Emergency}
            disabled={isCallLoading}
          >
            <View style={styles.assistanceContent}>
              <View style={[styles.assistanceIconContainer, { backgroundColor: '#F44336' }]}>
                <Ionicons name="warning" size={28} color="white" />
              </View>
              <View style={styles.assistanceTextContainer}>
                <Text style={styles.assistanceButtonText}>911 Emergency</Text>
                <Text style={styles.assistanceSubtext}>Emergency services</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

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

       {/* Contact Selection Modal */}
       <Modal
         visible={showContactModal}
         animationType="slide"
         presentationStyle="pageSheet"
       >
         <SafeAreaView style={styles.modalContainer}>
           <View style={styles.modalHeader}>
             <View style={styles.modalHeaderContent}>
               <TouchableOpacity onPress={() => setShowContactModal(false)}>
                 <Ionicons name="close" size={28} color="#8b6f47" />
               </TouchableOpacity>
               <Text style={styles.modalTitle}>Call Contact</Text>
               <View style={{ width: 28 }} />
             </View>
           </View>

           <View style={styles.modalContent}>
             <Text style={styles.modalSubtitle}>Select a contact to call:</Text>
             <FlatList
               data={contacts}
               renderItem={renderContact}
               keyExtractor={(item) => item._id}
               showsVerticalScrollIndicator={false}
               contentContainerStyle={styles.contactsList}
             />
           </View>
         </SafeAreaView>
       </Modal>
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
  mainCallButton: {
    backgroundColor: '#2196F3',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  mainCallContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainCallIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mainCallTextContainer: {
    flex: 1,
  },
  mainCallButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mainCallSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  assistanceContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  assistanceButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e6dcc6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assistanceContent: {
    alignItems: 'center',
  },
  assistanceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  assistanceTextContainer: {
    alignItems: 'center',
  },
  assistanceButtonText: {
    color: '#8b6f47',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  assistanceSubtext: {
    color: '#a0845c',
    fontSize: 12,
    textAlign: 'center',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5dc',
  },
  modalHeader: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e6dcc6',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b6f47',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#8b6f47',
    marginBottom: 16,
    fontWeight: '500',
  },
  contactsList: {
    paddingBottom: 20,
  },
  contactModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e6dcc6',
  },
  contactModalAvatar: {
    fontSize: 32,
    marginRight: 16,
  },
  contactModalInfo: {
    flex: 1,
  },
  contactModalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8b6f47',
    marginBottom: 4,
  },
  contactModalPhone: {
    fontSize: 14,
    color: '#a0845c',
  },
});
