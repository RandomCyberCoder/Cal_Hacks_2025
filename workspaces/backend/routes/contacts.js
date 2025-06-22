import express from 'express';
import User from '../models/user.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all contacts for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('contacts');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      contacts: user.contacts || []
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch contacts', 
      error: error.message 
    });
  }
});

// Add a new contact
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, phoneNumber, email, avatar } = req.body;

    // Validation
    if (!name?.trim() || !phoneNumber?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and phone number are required' 
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Create new contact object
    const newContact = {
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email?.trim() || '',
      avatar: avatar || '👤'
    };

    // Add contact to user's contacts array
    user.contacts.push(newContact);
    await user.save();

    // Get the newly added contact (with generated _id)
    const addedContact = user.contacts[user.contacts.length - 1];

    res.status(201).json({
      success: true,
      message: 'Contact added successfully',
      contact: addedContact
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add contact', 
      error: error.message 
    });
  }
});

// Update a contact
router.put('/:contactId', authenticateToken, async (req, res) => {
  try {
    const { contactId } = req.params;
    const { name, phoneNumber, email, avatar } = req.body;

    // Validation
    if (!name?.trim() || !phoneNumber?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and phone number are required' 
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Find the contact to update
    const contact = user.contacts.id(contactId);
    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    // Update contact fields
    contact.name = name.trim();
    contact.phoneNumber = phoneNumber.trim();
    contact.email = email?.trim() || '';
    contact.avatar = avatar || '👤';

    await user.save();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      contact: contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update contact', 
      error: error.message 
    });
  }
});

// Delete a contact
router.delete('/:contactId', authenticateToken, async (req, res) => {
  try {
    const { contactId } = req.params;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Find and remove the contact
    const contact = user.contacts.id(contactId);
    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    // Remove the contact using MongoDB's pull method
    user.contacts.pull(contactId);
    await user.save();

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete contact', 
      error: error.message 
    });
  }
});

export { router as contactsRouter }; 