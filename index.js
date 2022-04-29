const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app=express()
const port=process.env.PORT||4000

//middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.arfbr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
console.log(uri);
//heroku link https://enigmatic-beach-29740.herokuapp.com/

async function run() {
  try {
    await client.connect();
    const productsCollection = client.db("warehouse").collection("products");
    
    app.get('/products',async(req,res)=>{
      const query={}
      const cursor=productsCollection.find(query)
      const result=await cursor.toArray()
      res.send(result)
    })
    
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('welcome to electronics warehouse server')
})

app.listen(port,()=>{
    console.log('Listing to port',port);
})