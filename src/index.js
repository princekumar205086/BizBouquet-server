const express = require('express')
const cors = require('cors')
const connection = require('./db/connection/connection')
const app = express()
const port = process.env.PORT || 3000
const router = require('../routers/register')
//using cors here
app.use(cors())

//parsing json
app.use(express.json())

//giving permission for router
app.use(router)

// Homepage - cotroller
app.get('/', function (req, res) {
  res.status(200).send('Hello User!')
})

//setting base url for server 
app.listen(port, () => {
  console.log(`Server is running on ${port}`)
});


