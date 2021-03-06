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
    res.send("Database Connected Successfully");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v0ilw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
client.connect((err) => {
    console.log("connection err", err);
    const productCollection = client
        .db("ph-assignment10")
        .collection("products");
    const orders = client.db("ph-assignment10").collection("orders");

    app.get("/products", (req, res) => {
        productCollection.find().toArray((err, items) => {
            res.send(items);
        });
    });

    app.get("/orders", (req, res) => {
        orders.find({ email: req.query.email }).toArray((err, items) => {
            res.send(items);
        });
    });

    app.get("/product/:id", (req, res) => {
        productCollection
            .find({ _id: ObjectId(req.params.id) })
            .toArray((err, items) => {
                res.send(items[0]);
            });
    });

    app.post("/addEvent", (req, res) => {
        const newEvent = req.body;
        productCollection.insertOne(newEvent).then((result) => {
            res.send(result.insertedCount > 0);
        });
    });

    app.delete("/delete/:id", (req, res) => {
        const id = ObjectId(req.params.id);
        productCollection.findOneAndDelete({ _id: id }).then((documents) => {
            res.send(!!documents.value);
        });
    });

    app.post("/newOrder", (req, res) => {
        const newOrder = req.body;
        orders.insertOne(newOrder).then((result) => {
            res.send(result.insertedCount > 0);
        });
    });
});

app.listen(process.env.PORT || port);
