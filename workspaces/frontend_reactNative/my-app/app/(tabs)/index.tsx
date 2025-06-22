import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { user, logout } = useAuth();

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
