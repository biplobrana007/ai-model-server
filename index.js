const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://aimodel-db:qsHVvnKJCgPQJWyc@aimodelcluster.xnrsyug.mongodb.net/?appName=AiModelCluster";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("aimodel-db");
    const modelCollections = db.collection("models");
    //get models
    app.get("/models", async (req, res) => {
      const result = await modelCollections.find().toArray();
      res.send(result);
    });

    // add new model
    app.post("/models", async (req, res) => {
      const data = req.body;
      const result = await modelCollections.insertOne(data);
      res.send({
        success: true,
      });
    });

    //show model details
    app.get("/models/:id", async (req, res) => {
      const { id } = req.params;
      const result = await modelCollections.findOne({ _id: new ObjectId(id) });
      res.send({
        success: true,
        result,
      });
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

    await client.db("admin").command({ ping: 1 });
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
