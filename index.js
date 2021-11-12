const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const admin = require("firebase-admin");
const port = process.env.PORT || 2000;
require('dotenv').config();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ywrmz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri);

async function main (){
  try{
      await client.connect();
      const database = client.db("ApartmentsDb");
      const apartmentsCollection = database.collection("apartments");
      const usersCollection = database.collection("users");
      const ordersCollection = database.collection("orders");
      const reviewsCollection = database.collection("reviews");

      app.get("/apartments", async (req, res) =>{

        const query =  apartmentsCollection.find({});
        const result = await query.toArray();
        res.json(result);
      })

     app.post('/users', async (req, res) =>{
       const user = req.body;
       const result = await usersCollection.insertOne(user);
       res.json(result);
     })
   
     app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email};
      const option = {upsert: true};
      const updateDoc= {
          $set: user
      };
      const result = await usersCollection.updateOne(filter, updateDoc, option);
      res.json(result);
  });
     //making admin 
     app.put('/users/admin', async (req, res) =>{
       const user = req.body;
      //  const decodedUser = await admin.auth();
      //  req.decodedEmail = decodedUser.email;
      //  if(req.decodedEmail)
      //  {

      //  }
       const filter = {email: user.email};
       const updateDoc = {$set:{role: 'admin'}};
       const result = await usersCollection.updateOne(filter, updateDoc);
       res.json(result);
    })
    //Checking admin
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = {email: email};
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if(user?.role === 'admin')
      {
        isAdmin = true;
      }
      res.json({admin: isAdmin});
    })

     //Place order for posting data
     app.post('/orders', async (req, res) =>{
        const user = req.body;
        const result = await ordersCollection.insertOne(user);
        res.json(result);
     })

     

     //Place my orders 
     app.get('/orders', async (req, res) =>{
      const email = req.query.email;
      const query = {email: email}
      const user = await ordersCollection.find(query).toArray();
      res.json(user);
    })

     //Place manage orders for get data
     app.get('/allOrders', async (req, res) =>{
       const orders =  ordersCollection.find({});
       const result =await orders.toArray();
       console.log(result);
       res.json(result);
     })

     //Delete apartments data
     app.delete('/apartments/:id', async (req, res) =>{
       const id = req.params.id;
       const query = {_id: ObjectId(id)};
       const result = await apartmentsCollection.deleteOne(query);
       res.json(result);
     })
     //Delete all Orders data
     app.delete('/allOrders/:id', async (req, res) =>{
       const id = req.params.id;
       const query = {_id: ObjectId(id)};
       const result = await ordersCollection.deleteOne(query);
       res.json(result);
     })
     //Delete Orders data
     app.delete('/allOrders/:id', async (req, res) =>{
       const id = req.params.id;
       console.log(id);
       const query = {_id: ObjectId(id)};
       console.log(query);
       const result = await ordersCollection.deleteOne(query);
       res.json(result);
     })

     //Review post data
     app.post('/reviews', async (req, res) =>{
       const move = req.body;
       const result = await reviewsCollection.insertOne(move);
       res.json(result);
     })
     app.get('/reviews', async (req, res) =>{
       const review = reviewsCollection.find({});
       const result = await review.toArray();
       res.json(result);
     })

    //  //Update status read
    //  app.get('/allOrders/:id', async (req, res) =>{
    //    const id = req.params.id;
    //    const query = {_id: id};
    //    const UpdateStatus = await ordersCollection.findOne(query);
    //    res.send(UpdateStatus);
    //  })

    //  //Update status 
    //  app.put('/allOrders/:id', async (req, res) =>{
    //    const id = req.params.id;
    //    const updateStatus = req.body;
    //    const filter = {_id: id};
    //    const option = {upsert: true};
    //    const updateDoc = {
    //      $set: {
    //        status: updateStatus.status
    //      }
    //    };
    //    const result = await ordersCollection.updateOne(filter, updateDoc, option);
    //    res.json(result);
    //   })     
  }
  finally{
    //   await client.close();
  }
}
main().catch(console.dir);



app.get('/', async (req, res) => {
    res.send("Running Apartments sales server");
})

app.listen(port, ()=>{
    console.log("listening on port " + port);
});