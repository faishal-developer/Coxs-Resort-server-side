//importing files
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectID = require('mongodb').ObjectID;
const fileUpload = require('express-fileupload')
require('dotenv').config();
const port = process.env.PORT || 5000;

//using differnt apps
const app = express();
app.use(cors());
app.use(express.json())
app.use(fileUpload());

//connecting to database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yaqej.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(process.env.DB_USER);
//database.collection api calling here
async function run() {
    try {
        await client.connect();
        const database = client.db("cox_resort");
        const rooms = database.collection("rooms");
        const orders = database.collection("orders");
        console.log('connected with mongodb');
        //getting rooms by get method
        app.get('/rooms', async (req, res) => {
            const cursor = rooms.find({});
            const result = await cursor.toArray();
            res.json(result)
        })
        //getting orders all by get
        app.get('/orders', async (req, res) => {
            const cursor = orders.find({});
            const result = await cursor.toArray();
            res.json(result)
        })
        //getting orders by email
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const cursor = orders.find(query);
            const result = await cursor.toArray();
            res.json(result)
        })
        //getting single room by get method
        app.get('/rooms/:roomId', async (req, res) => {
            let id = req.params.roomId
            const query = { _id: ObjectID(id) };
            const result = await rooms.findOne(query);
            res.json(result)
        })

        //posting a new service 
        app.post('/rooms', async (req, res) => {
            let body = req.body
            const image = req.files.img;
            const imageData = image.data;
            const encodeImage = imageData.toString('base64')
            const imageBuffer = Buffer.from(encodeImage, 'base64')
            body.img = imageBuffer;
            const result = await rooms.insertOne(body);
            res.json(result);
        })
        //posting a orders in orders
        app.post('/orders', async (req, res) => {
            let body = req.body
            const result = await orders.insertOne(body);
            res.json(result);
        })
        //updating a order
        app.put('/orders/:itemId', async (req, res) => {
            const id = req.params.itemId;
            const filter = { _id: ObjectID(id) };
            console.log('working');
            const updateDoc = {
                $set: {
                    status: 'okay'
                },
            };
            const result = await orders.updateOne(filter, updateDoc);
            res.json(result);

        })

        //deleting a order
        app.delete('/orders/:itemId', async (req, res) => {
            const id = req.params.itemId;
            const query = { _id: ObjectID(id) };
            const result = await orders.deleteOne(query);
            res.json(result)
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('this is working')
})
app.get('/check', (req, res) => {
    res.send('this is cheking')
})
app.listen(port, () => {
    console.log('app is running');
})