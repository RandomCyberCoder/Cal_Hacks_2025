import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import eventEntrySchema from './event.js'
import zoneEntrySchema from './zone.js';
import contactEntrySchema from "./contact.js"




const userSchema = new mongoose.Schema({
    userName: {type: String, required: true, unique: true, minlength: 3, maxlength: 20},
    password: {type: String, required: true, minlength: 6},
    contacts: [contactEntrySchema],
    events: [eventEntrySchema],
    zones: [zoneEntrySchema],
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;