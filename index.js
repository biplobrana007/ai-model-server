const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@aimodelcluster.xnrsyug.mongodb.net/?appName=AiModelCluster`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const db = client.db("aimodel-db");
    const modelCollections = db.collection("models");
    const purchasedCollections = db.collection("purchased-models");

    //get models
    app.get("/models", async (req, res) => {
      const result = await modelCollections.find().toArray();
      res.send(result);
    });

    // add new model
    app.post("/models", async (req, res) => {
      const data = req.body;
      const result = await modelCollections.insertOne(data);
      res.send(result);
    });

    //show model details
    app.get("/models/:id", async (req, res) => {
      const { id } = req.params;
      const result = await modelCollections.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    //update model
    app.put("/models/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const update = { $set: data };

      const result = await modelCollections.updateOne(filter, update);

      res.send({ success: true, result });
    });

    // delete model
    app.delete("/models/:id", async (req, res) => {
      const { id } = req.params;
      const result = await modelCollections.deleteOne({
        _id: new ObjectId(id),
      });

      res.send({ success: true, result });
    });

    // latest models
    app.get("/latest-models", async (req, res) => {
      const result = await modelCollections
        .find()
        .sort({ createdAt: "desc" })
        .limit(6)
        .toArray();

      res.send({ success: true, result });
    });

    // my models
    app.get("/my-models", async (req, res) => {
      const email = req.query.email;
      const result = await modelCollections
        .find({ createdBy: email })
        .toArray();

      res.send(result);
    });

    // purchase model post
    app.post("/purchased-models/:id", async (req, res) => {
      const data = req.body;
      const id = req.params.id;
      const result = await purchasedCollections.insertOne(data);
      const filter = { _id: new ObjectId(id) };
      const update = {
        $inc: {
          purchased: 1,
        },
      };
      const purchasedCounted = await modelCollections.updateOne(filter, update);
      res.send(result, purchasedCounted);
    });

    // get purchased

    app.get("/my-purchased-models", async (req, res) => {
      const email = req.query.email;
      const result = await purchasedCollections
        .find({ purchasedBy: email })
        .toArray();

      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
