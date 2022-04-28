const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app=express()
const port=process.env.PORT||4000

//middleware
app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('welcome to electronics warehouse server')
})

app.listen(port,()=>{
    console.log('Listing to port',port);
})