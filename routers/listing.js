//importing express
const express = require('express')
//configuring router
const router = new express.Router()
// specifying register models
const Listing = require('../src/db/schema/addlistingSchema')


router.post('/add_listing', (req, res) => {
    // try {
    //     req.body
    // } catch (error) {     
    // }
})