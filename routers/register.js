//importing express
const express = require('express');
//reading env file
require('dotenv').config()
//configuring router
const router = new express.Router();
// importng bcrypt to encrypt to data
const bcrypt = require('bcrypt');
// specifying register models
const Register = require('../src/db/schema/regschema')
// specifying otp verification model
const OtpVerificaton = require('../src/db/schema/otpshema')
// Add listing here
const AddListing = require('../src/db/schema/addlistingSchema')
// importing nodemailer to imlement email
const nodemailer = require('nodemailer')

// create transporter for nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    requireTLS: true,
    auth: {
        user: process.env.MY_EMAIL_ID,
        pass: process.env.MY_PASSWORD
    }
})

//Register - controller
router.post('/register', (req, res) => {
    try {
        let { fullname, email, phone, password } = req.body;
        // encrypting password
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds).
            then(async (hashedpassword) => {
                try {
                    const regData = {
                        fullname: fullname.trim(),
                        email: email.trim(),
                        phone: phone,
                        password: hashedpassword,
                        user_status: false
                    }
                    const regUser = new Register(regData);
                    const insertUser = await regUser.save()
                    res.status(201).send(insertUser)
                } catch (error) {
                    console.log(error)
                    res.status(400).send(error)
                }
                //send otp
                sendOtpVerificaton(req.body.email);

            })
    } catch (error) {
        console.log(error);
        res.status(400).send(error)
    }
})
// for otp verification to email
const sendOtpVerificaton = async (email) => {
    try {
        const otp = `${Math.floor(100000 + Math.random() * 900000)}`
        //setting mail
        const settingEmail = {
            from: process.env.MY_EMAIL_ID,
            to: email,
            subject: 'Account verification|Bizbouquet',
            html: `<p>This is otp: ${otp} to verify your account. <br/> Otp expires in 10min!</p><p>Thanks for connecting with us!</p>`
        }
        // encypting otp
        const saltRounds = 10;
        const hashedotp = await bcrypt.hash(otp, saltRounds)
        const saveotp = await new OtpVerificaton({
            otp: hashedotp,
            email: email,
            createdAt: Date.now(),
            expiresAt: Date.now() + 600000
        })
        await saveotp.save()
        // triggering mail
        transporter.sendMail(settingEmail, (error, res) => {
            res ? console.log("Email sent successfully") : console.log(error);
            // res.json({
            //     status:'pending',
            //     message: "verification otp email sent",
            //     data: {
            //         email,
            //     },
            // })
        })
    } catch (error) {
        console.log(error);
    }
}
// verify otp

router.post("/verifyotp", async (req, res) => {
    try {
        let { email, otp } = req.body
        if (!email || !otp) {
            throw Error('Please input value')
        }
        else {
            const userotp = await OtpVerificaton.find({ email, })
            if (userotp.length <= 0) {
                throw new Error('Account doesnot exits or already verified !')
            }
            else {
                const expiresAt = userotp[0]
                const hashedotp = userotp[0].otp
                if (expiresAt < Date.now()) {
                    await OtpVerificaton.deleteMany({ email })
                    throw new Error('Code has expires, request new again!')
                }
                else {
                    const validotp = await bcrypt.compare(otp, hashedotp)
                    if (!validotp) {
                        throw new Error('Please Enter valid otp')
                    }
                    else {
                        try {
                            await Register.updateOne({ email: email }, { user_status: true })
                            await OtpVerificaton.deleteMany({ email })
                            res.json({
                                status: 'verified',
                                message: `user email verified successfully.`,
                            })
                            // res.status(200).send(verified)
                        } catch (error) {
                            const message = "Accont doest not exits!"
                            res.status(400).send(message)
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
        res.status(400).send(error)
    }
})

// resend otp

router.post("/resendotp", async (req, res) => {
    try {
        let { email } = req.body
        if (!email) {
            throw Error('Please input value')
        }
        else {
            //deleting existing
            await OtpVerificaton.deleteMany({ email })
            sendOtpVerificaton(email);
            res.json({
                status: 'Success',
                message: 'otp resend'
            })
        }
    } catch (error) {
        console.log(error);
        res.status(400).send(error)
    }
})

//calling profile of all users 
router.get('/register', async (req, res) => {
    try {
        const getUsers = await Register.find({})
        res.send(getUsers)
    } catch (error) {
        res.status(400).send(error)
    }
})
//calling profile of particular user
router.get('/register/:id', async (req, res) => {
    try {
        const _id = req.params.id;
        const getUser = await Register.findById({ _id })
        res.send(getUser)
    } catch (error) {
        res.status(400).send(error)
    }
})

//calling profile of particular user and update 
router.patch('/register/:id', async (req, res) => {
    try {
        const _id = req.params.id;
        const updateUser = await Register.findByIdAndUpdate(_id, req.body, { new: true })
        res.send(updateUser)
    } catch (error) {
        res.status(500).send(error)
    }
})

//Deleting profile of particular user and update 
router.delete('/register/:id', async (req, res) => {
    try {
        const deleteUser = await Register.findByIdAndDelete(req.params.id)
        res.send(deleteUser)
    } catch (error) {
        res.status(500).send(error)
    }
})
// search query

router.get('/search/:key', async (req, res) => {
    try {
        const result = await Register.find(
            { 
                "$or":[
                    {fullname: { $regex: req.params.key}} 
                ]
            }) 
            res.status(200).send(result)
    } catch (error) {
        res.status(404).send({error: 'No data found'})
    }
})

/* 
1. auth from here
2. login from here
3. JWT implementation from here
*/


// login 

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            res.status(200).send({ error: "Input filed can't be blank!" })
        }
        else {
            const userlogin = await Register.findOne({ email: email })
            const ismatch = await bcrypt.compare(password, userlogin.password)
            if (!ismatch) {
                res.status(400).send({ error: "Invalid credentials" })
            }
            else {
                res.status(200).send({ message: "Successful signin" })
            }
            // res.status(400).send({ error: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error);
    }
})

// add listing api

router.post('/addlisting', async(req, res)=>{
    try {
        const add = new AddListing(req.body);
        await add.save()
        res.status(201).send(add)
    } catch (error) {
        res.status(400).send(error)
        console.log(error);
    }
})

// serch business
router.get('/searchlist/:key', async (req, res) => {
    try {
        const result = await AddListing.find(
            { 
                "$or":[
                    {b_name: { $regex: req.params.key}} 
                ]
            }) 
            res.status(200).send(result)
    } catch (error) {
        res.status(404).send({error: 'No data found'})
    }
})
module.exports = router