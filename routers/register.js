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
                sendOtpVerificaton(res._id, req.body.email);

            })
    } catch (error) {
        console.log(error);
        res.status(400).send(error)
    }
})

// for otp verification to email
const sendOtpVerificaton = async (_id, email) => {
    try {
        const otp = `${Math.floor(100000 + Math.random() * 900000)}`
        const settingEmail = {
            from: process.env.MY_EMAIL_ID,
            to: email,
            subject: 'Account verification|Bizbouquet',
            html: `<p>This is otp: ${otp} to verify your account. <br/> Otp expires in 10min!</p><p>Thanks for connecting with us!</p>`
        }
        // encypting otp
        const saltRounds = 10;
        const hashedotp = await bcrypt.hash(otp, saltRounds)
        const saveotp = new OtpVerificaton({
            userId: _id,
            otp: hashedotp,
            email: email,
            createdAt: Date.now(),
            expiresAt: Date.now() + 600000
        })
        await saveotp.save()
        // triggering mail
        transporter.sendMail(settingEmail, (error, res) => {
            res ? console.log("Email sent successfully") : console.log(error);
        })
    } catch (error) {
        console.log(error);
    }
}
// verify otp

router.post("/verifyotp", async (req, res) => {
    try {
        let {email, otp} = req.body
        if (!email || !otp) {
            throw Error('Please input value')
        }
        else {
            const userotp = await OtpVerificaton.findOne({ email:email })
            if (!userotp) {
                throw new Error('Account doesnot exits!')
            }
            else {
                const  expiresAt  = userotp[0]
                const hashedotp = userotp[0][1]
                if (expiresAt < Date.now()) {
                    throw new Error('Code has expires, request new again!')
                }
                else {
                    const validotp = await bcrypt.compare(otp, hashedotp)
                    if (!validotp) {
                        throw new Error('Please Enter valid otp')
                    }
                    else {
                        try {
                            const verified = await Register.updateOne({ email: email }, { user_status: true })
                            await OtpVerificaton.deleteMany({ email })
                            res.status(200).send(verified)
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
        let { userId, email } = req.body
        if (!userId || !email) {
            throw Error('Please input value')
        }
        else {
            //deleting existing
            await OtpVerificaton.deleteMany({ userId })
            sendOtpVerificaton({ _id: userId, email }, res);
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


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            res.status(200).send({ error: "Input filed can't be blank!" })
        }
        else {
            const userlogin = await Register.findOne({ email: email })
            let hashedpassword = ''
            if (userlogin) {
                hashedpassword = userlogin.password
            }
            else {
                hashedpassword = ''
            }
            // matching password
            const ismatch = await bcrypt.compare(password, hashedpassword)
            if (!ismatch) {
                res.status(400).send({ error: "Invalid credentials" })
            }
            else {
                res.status(200).send({ message: "Successful signin" })
            }
            res.status(400).send({ error: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error);
    }
})


module.exports = router