import mongoose from "mongoose";

const contactEntrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
    },
    avatar: {
        type: String,
        default: '👤'
    }
}, {
    timestamps: true
});

export default contactEntrySchema;