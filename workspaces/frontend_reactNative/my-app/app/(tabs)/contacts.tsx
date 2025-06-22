import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { contactsAPI } from '@/services/api';
// Removed LinearGradient import for simplified design

interface Contact {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  avatar: string;
}

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    avatar: '👤',
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await contactsAPI.getContacts();
      if (response.success) {
        setContacts(response.contacts);
      } else {
        Alert.alert('Error', 'Failed to load contacts');
      }
    } catch (error) {
      console.error('Load contacts error:', error);
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const avatarOptions = ['👤', '👨', '👩', '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍🔬', '👩‍🔬'];

  const addContact = async () => {
    if (!newContact.name.trim() || !newContact.phoneNumber.trim()) {
      Alert.alert('Error', 'Please fill in name and phone number');
      return;
    }

    try {
      const response = await contactsAPI.addContact({
        name: newContact.name.trim(),
        phoneNumber: newContact.phoneNumber.trim(),
        email: newContact.email.trim(),
        avatar: newContact.avatar,
      });

      if (response.success) {
        setContacts([...contacts, response.contact]);
        setNewContact({ name: '', phoneNumber: '', email: '', avatar: '👤' });
        setShowAddModal(false);
        Alert.alert('Success', 'Contact added successfully!');
      } else {
        Alert.alert('Error', response.message || 'Failed to add contact');
      }
    } catch (error) {
      console.error('Add contact error:', error);
      Alert.alert('Error', 'Failed to add contact');
    }
  };

  const deleteContact = (contactId: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const response = await contactsAPI.deleteContact(contactId);
            if (response.success) {
              setContacts(contacts.filter(contact => contact._id !== contactId));
              Alert.alert('Success', 'Contact deleted successfully!');
            } else {
              Alert.alert('Error', response.message || 'Failed to delete contact');
            }
          } catch (error) {
            console.error('Delete contact error:', error);
            Alert.alert('Error', 'Failed to delete contact');
          }
        }},
      ]
    );
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity style={styles.contactCard}>
      <View style={styles.contactContent}>
        <View style={styles.contactLeft}>
          <Text style={styles.contactAvatar}>{item.avatar}</Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
            {item.email ? <Text style={styles.contactEmail}>{item.email}</Text> : null}
          </View>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteContact(item._id)}
        >
          <Ionicons name="trash-outline" size={20} color="#8b6f47" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          My Contacts
        </ThemedText>
        <Text style={styles.contactCount}>
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b6f47" />
            <Text style={styles.loadingText}>Loading contacts...</Text>
          </View>
        ) : contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={styles.emptyTitle}>No contacts yet</Text>
            <Text style={styles.emptySubtitle}>Add your first contact to get started!</Text>
          </View>
        ) : (
          <FlatList
            data={contacts}
            renderItem={renderContact}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={28} color="#8b6f47" />
        <Text style={styles.addButtonText}>Add Contact</Text>
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color="#8b6f47" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Contact</Text>
              <TouchableOpacity onPress={addContact}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.avatarSection}>
              <Text style={styles.fieldLabel}>Choose Avatar</Text>
              <View style={styles.avatarOptions}>
                {avatarOptions.map((avatar, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.avatarOption,
                      newContact.avatar === avatar && styles.selectedAvatar
                    ]}
                    onPress={() => setNewContact({ ...newContact, avatar })}
                  >
                    <Text style={styles.avatarText}>{avatar}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                value={newContact.name}
                onChangeText={(text) => setNewContact({ ...newContact, name: text })}
                placeholder="Enter contact name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={newContact.phoneNumber}
                onChangeText={(text) => setNewContact({ ...newContact, phoneNumber: text })}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Email (Optional)</Text>
              <TextInput
                style={styles.input}
                value={newContact.email}
                onChangeText={(text) => setNewContact({ ...newContact, email: text })}
                placeholder="contact@email.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
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
  header: {
    alignItems: 'center',
    backgroundColor: '#f5f5dc',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e6dcc6',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8b6f47',
    marginBottom: 8,
  },
  contactCount: {
    fontSize: 16,
    color: '#a0845c',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    paddingBottom: 100,
  },
  contactCard: {
    marginBottom: 15,
    borderRadius: 16,
    backgroundColor: 'white',
    padding: 20,
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
  contactContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactAvatar: {
    fontSize: 40,
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b6f47',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#a0845c',
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 12,
    color: '#b8956d',
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#f5f5dc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e6dcc6',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    shadowColor: '#8b6f47',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#e6dcc6',
  },
  addButtonText: {
    color: '#8b6f47',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
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
  saveButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b6f47',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  avatarSection: {
    marginBottom: 30,
  },
  avatarOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  avatarOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e6dcc6',
  },
  selectedAvatar: {
    borderColor: '#8b6f47',
    backgroundColor: '#f9f7f1',
  },
  avatarText: {
    fontSize: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b6f47',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e6dcc6',
    shadowColor: '#8b6f47',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
