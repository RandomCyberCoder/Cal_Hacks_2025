import mongoose from 'mongoose';

const zoneEntrySchema = new mongoose.Schema({
    topLeftCoord: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    bottomRightCoord: {
        type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
})

export default zoneEntrySchema;