const mongoose = require("mongoose");

// offline configration
// const connection = mongoose.connect("mongodb://localhost:27017/bd-api",{}).then(()=>{
//     console.log("connection successful");
// }).catch((e)=>{
//     console.log("something went wrong!");
// })

// mongodb cloud configration

const connection = mongoose.connect("mongodb+srv://princeraj:prince123@cluster0.agloup8.mongodb.net/bd-api?retryWrites=true&w=majority",{}).then(()=>{
    console.log("connection successful");
}).catch((e)=>{
    console.log("something went wrong!");
})

