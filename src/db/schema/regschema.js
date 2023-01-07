const mongoose = require("mongoose")

const schemaOptions = {
    timestamps: { createdAt: 'created_at', default: Date.now().toString(), updatedAt: 'updated_at', default: Date.now().toLocaleString()},
  };
// schema for registration
const regSchema = new mongoose.Schema({
    fullname: {
        type: String, 
        required: true,
        minlenth: 3
    },
    email: {
        type: String,
        required: true,
        unique: [true, "Email id is already in use!"],    
    },
    phone : {
        type: Number,
        min:10,
        required: true,
    },
    password: {
        type: String,
        min:8,
        required:true
    },
    user_status: {
        type: Boolean,
        required:true
    },
    // date_of_join :{
    //     type: Date,
    //     default: Date.now().toString()
    // }
}, schemaOptions)


// register model
const AddListing = new mongoose.model("User_registration", regSchema);
module.exports = AddListing