const mongoose = require("mongoose");
const connection = mongoose.connect("mongodb://localhost:27017/bd-api",{}).then(()=>{
    console.log("connection successful");
}).catch((e)=>{
    console.log("something went wrong!");
})
