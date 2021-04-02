
const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const port = process.env.PORT || 5055;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v0ilw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
client.connect((err) => {
    console.log("connection err", err);
    const eventCollection = client.db("ph-assignment10").collection("products");
    const orders = client.db("ph-assignment10").collection("orders");

    app.get("/products", (req, res) => {
        console.log(eventCollection);
        eventCollection.find().toArray((err, items) => {
            res.send(items);
        });
    });

    app.get("/orders", (req, res) => {
        // console.log(req.query.email);
        orders.find({email: req.query.email}).toArray((err, items) => {
            res.send(items);
        });
    });

    app.get("/product/:id", (req, res) => {
        console.log('product-id', ObjectId(req.params.id));
        eventCollection.find({_id: ObjectId(req.params.id)})
        .toArray((err, items) => {
          console.log('error', err, 'res', items);
            res.send(items[0]);
        });
    });

    app.post("/addEvent", (req, res) => {
        const newEvent = req.body;
        console.log("adding new event: ", newEvent);
        eventCollection.insertOne(newEvent).then((result) => {
            console.log("inserted count", result.insertedCount);
            res.send(result.insertedCount > 0);
        });
    });

    app.delete("/delete/:id", (req, res) => {
        const id = ObjectId(req.params.id);
        eventCollection
            .findOneAndDelete({ _id: id })
            .then((documents) => res.send(!!documents.value));
    });

    app.post('/newOrder', (req, res) => {
        const newOrder = req.body;
        orders.insertOne(newOrder)
        .then(result => {
            res.send(result.insertedCount > 0 );
        })
        console.log(newOrder);
    })

});

app.listen(process.env.PORT || port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
