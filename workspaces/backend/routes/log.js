import express from 'express';
import User from '../models/user.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all contacts for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('events');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      events: user.events || []
    });
  } catch (error) {
    console.error('Get logss error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch logs', 
      error: error.message 
    });
  }
});


// Add a new log
router.post('/new', authenticateToken, async (req, res) => {
  try {
    const { timestamp, Note, location} = req.body;

    // Validation
    if (!timestamp || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'timestamp and location required' 
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
        timestamp: timestamp,
        Note: Note,
        location: {
            type: 'Point',
            coordinates: location.coordinates
        }
    };

    // Add contact to user's contacts array
    user.events.push(newContact);
    await user.save();

    // Get the newly added contact (with generated _id)
    const addedEvent = user.events[user.events.length - 1];

    res.status(201).json({
      success: true,
      message: 'Event added successfully',
      contact: addedEvent
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add Event', 
      error: error.message 
    });
  }
});




export { router as logRouter }; 