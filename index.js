const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

//middleware
app.use(cors());
app.use(express.json());

const res = require("express/lib/response");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.arfbr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
//heroku link https://enigmatic-beach-29740.herokuapp.com/

async function run() {
  try {
    await client.connect();
    const productsCollection = client.db("warehouse").collection("products");

    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.post('/product',async(req,res)=>{
      const newItem=req.body
      console.log(newItem);
      const result = await productsCollection.insertOne(newItem);
      res.send(result)
    })

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
