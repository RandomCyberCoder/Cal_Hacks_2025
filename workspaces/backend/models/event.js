import mongoose from 'mongoose';

const timeSeriesEntrySchema = new mongoose.Schema({
  timestamp: { type: Date, default: (new Date()).toISOString()}, 
  Note: { type: String, default: "No Notes"},
  location: {
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
//   additionalField1: String,
});

// const eventEntrySchema = new mongoose.Schema({
//     timestamp: { type: Date, default: (new Date()).toISOString()}, 
//     timeSeries: [timeSeriesEntrySchema]
// })

export default timeSeriesEntrySchema;