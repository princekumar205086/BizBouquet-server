// //importing express
// const express = require('express')
// //configuring router
// const router = new express.Router()
// // specifying register models
// const AddListing = require('../src/db/schema/addlistingSchema')



// // listing api check
// router.get('/add', (req, res)=>{
//     try {
//         res.status(200).send('Hello User!')
//     } catch (error) {
//         console.log(error);
//     }
// })

// // add listing api

// router.post('/addlisting', (req, res)=>{
//     try {
//         const add = new AddListing(req.body);
//         res.status(201).send(add)
//     } catch (error) {
//         res.status(400).send(error)
//         console.log(error);
//     }
// })

// module.exports = router