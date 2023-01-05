const mongoose = require("mongoose")


//schema for otp verification
const UserOtpVerification = new mongoose.Schema({
    otp: String,
    email:String,
    createdAt: Date,
    expiresAt: Date
})


//otp verification model
const OtpVerificaton = new mongoose.model("User_otpverification", UserOtpVerification);
module.exports = OtpVerificaton