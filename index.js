const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

//middleware
app.use(cors());
app.use(express.json());

//verify jwt
const verifyJWT=(req,res,next)=>{
const authHeader = req.headers.authorization;
if (!authHeader) {
  return res.status(401).send({ message: "unauthorized access" });
}
const token=authHeader.split(' ')[1]
jwt.verify(token, process.env.ACCESS_TOKEN,(err,decoded)=>{
  if(err){
    return res.status(403).send({message:'forbidden access'})
  }
  req.decoded=decoded
  next()
});
}

const res = require("express/lib/response");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.arfbr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productsCollection = client.db("warehouse").collection("products");

    //token
    app.post('/login',async(req,res)=>{
      const user=req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN,{
        expiresIn:'2d'
      });
      res.send({token})
    })
     
    //get all products with pagination
    app.get("/products", async (req, res) => {
      const limit=parseInt(req.query.limit)
      const page=parseInt(req.query.page)
      const count=await productsCollection.estimatedDocumentCount()
      const query = {};
      const cursor = productsCollection.find(query);
      const result = await cursor.skip(limit*page).limit(limit).toArray();
    res.send({result,count});
    });

    //get api for my items with query email and verify jwt
    app.get('/items',verifyJWT, async(req,res)=>{
      const decodedEmail=req.decoded.email 
      const email=req.query.email
      if(email===decodedEmail){
        const query = { email };
        const cursor = productsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      }else{
       res.status(403).send({ message: "forbidden access" });
      }
      
    })

    //get a single product using id
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    //post api added a single product in mongodb  
    app.post('/product',async(req,res)=>{
      const newItem=req.body
      const result = await productsCollection.insertOne(newItem);
      res.send(result)
    })

    //update api for delivered and add quantity
    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const quantity = parseInt(req.body.newQuantity);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { quantity },
      };
      const result = await productsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //delete api for delete product
    app.delete('/product/:id',async(req,res)=>{
      const id=req.params.id
      const query={_id:ObjectId(id)}
      const result=await productsCollection.deleteOne(query)
      res.send(result)
    })

    
    
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("welcome to electronics warehouse server");
});

app.listen(port, () => {
  console.log("Listing to port", port);
});
