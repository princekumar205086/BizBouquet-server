const mongoose = require("mongoose")

const schemaOptions = {
    timestamps: { createdAt: 'created_at', default: Date.now().toString(), updatedAt: 'updated_at', default: Date.now().toLocaleString()},
  };
// schema for registration
const regSchema = new mongoose.Schema({
    b_name: {
        type: String, 
        required: true,
        minlenth: 3
    },
    b_loc: {
        type: String,
        required: true
    },
    b_src : {
        type: String,
        required: true,
    },
    b_contact: {
        type: Number,
        min:10,
        required:true
    },
    b_owner: {
        type: String,
        minlenth:3,
        required:true
    },
    b_rating:{
        type:Number,
        minlenth:1,
        requirred: true
    }
    // date_of_join :{
    //     type: Date,
    //     default: Date.now().toString()
    // }
}, schemaOptions)


// register model
const Add_listing = new mongoose.model("Add_business_listing", regSchema);
module.exports = Add_listing