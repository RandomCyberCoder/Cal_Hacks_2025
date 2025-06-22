import mongoose from "mongoose"

const contactEntrySchema = new mongoose.Schema({
    name: {type: String, default: ""},
    phoneNumber: {type: String,  minlength: 10, maxlength: 15}
});

export default contactEntrySchema;