import mongoose from 'mongoose';
import eventEntrySchema from './event.js'
import zoneEntrySchema from './zone.js';



const userSchema = new mongoose.Schema({
    userName: {type: String, required: true},
    password: {type: String, required: true, unique: true},
    events: [eventEntrySchema],
    zones: [zoneEntrySchema],
});

const User = mongoose.model('User', userSchema);

export default User;