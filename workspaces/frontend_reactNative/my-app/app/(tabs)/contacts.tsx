import { Image } from 'expo-image';
import { View, Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function TabTwoScreen() {
  
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="person"
          style={styles.headerImageEmergency}
        />
      }>
      <View style={styles.content}>
        <View style={styles.card}>
          <Ionicons name="person-circle-outline" size={48} color="#007AFF" style={styles.cardIcon} />
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Your Profile
          </ThemedText>
          <ThemedText type="default" style={styles.cardDescription}>
            Username: 
          </ThemedText>
          <ThemedText type="default" style={styles.cardDescription}>
            User ID: 
          </ThemedText>
        </View>

        <View style={styles.card}>
          <Ionicons name="calendar-outline" size={48} color="#34C759" style={styles.cardIcon} />
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Events
          </ThemedText>
          <ThemedText type="default" style={styles.cardDescription}>
            Manage your events and schedule
          </ThemedText>
        </View>

        <View style={styles.card}>
          <Ionicons name="location-outline" size={48} color="#FF9500" style={styles.cardIcon} />
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
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#F0191B',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  headerImageEmergency: {
    color: '#F0191B',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  container: {
    flex: 1,
    padding: 20,
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 12,
  },
  statusText: {
    color: '#2d5a2d',
    fontSize: 14,
    fontWeight: '500',
  },
});
