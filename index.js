const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, Db, ObjectId } = require("mongodb");
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 4000;
require("dotenv").config();

///
//
app.get("/", (req, res) => {
  res.send("Welcome to Ikra's recycle zone server...:)");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kzsxnqy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const userCollection = client.db("recycle_zone").collection("users");
    const productCollection = client.db("recycle_zone").collection("product");
    const adCollection = client.db("recycle_zone").collection("advertise");
    const categoryCollection = client.db("recycle_zone").collection("category");
    const orderCollection = client.db("recycle_zone").collection("order");
    //save user info to database
    app.put("/user", async (req, res) => {
      const info = req.body;

      const result = await userCollection.updateOne(
        { email: info.email },
        { $set: info },
        { upsert: true }
      );
      res.send(result);
    });

    //Check account type
    app.get("/admin/:email", async (req, res) => {
      const findByemail = await userCollection.findOne({
        email: req.params.email,
      });
      if (findByemail?.admin == true) {
        return res.send({ isAdmin: true });
      } else if (findByemail?.accountType == "seller") {
        return res.send({ isSeller: true });
      } else {
        return res.send({ isUser: true });
      }
    });

    app.patch("/addproduct", async (req, res) => {
      const { category } = req.body;

      const primaryKey = ObjectId();
      const result = await categoryCollection.updateOne(
        { name: category },
        { $push: { ["product"]: { ...req.body, primaryKey: primaryKey } } }
      );

      if (result.modifiedCount > 0) {
        const insertProduct = await productCollection.insertOne({
          ...req.body,
          primaryKey: primaryKey,
        });

        res.send(insertProduct);
      }
    });
    app.get("/category", async (req, res) => {
      const cursor = await categoryCollection.find({}).toArray();
      res.send(cursor);
    });
    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = await categoryCollection.findOne({ _id: ObjectId(id) });
      res.send(cursor);
    });
    // filter product by email
    app.get("/product/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = await productCollection.find({ email: email }).toArray();
      res.send(cursor);
    });
    app.patch("/product/:id", async (req, res) => {
      const category = req.query.category;

      const primaryKey = req.params.id;
      const result = await categoryCollection.updateOne(
        { name: category },
        { $pull: { ["product"]: { primaryKey: ObjectId(primaryKey) } } }
      );
      if (result.modifiedCount > 0) {
        const cursor = await productCollection.deleteOne({
          primaryKey: ObjectId(primaryKey),
        });
        res.send(cursor);
      }
    });

    app.post("/book", async (req, res) => {
      const data = req.body;
      const result = await orderCollection.insertOne(data);
      res.send(result);
    });
    app.get("/sellers", async (req, res) => {
      const result = await userCollection
        .find({ accountType: "seller" })
        .toArray();
      res.send(result);
    });
    app.delete("/sellers/:id", async (req, res) => {
      const id = req.params.id;
      const result = await userCollection.deleteOne({ _id: ObjectId(id) });

      res.send(result);
    });
    app.get("/buyers", async (req, res) => {
      const result = await userCollection
        .find({ accountType: "user" })
        .toArray();
      res.send(result);
    });
    app.delete("/buyers/:id", async (req, res) => {
      const id = req.params.id;
      const result = await userCollection.deleteOne({ _id: ObjectId(id) });

      res.send(result);
    });

    //
    app.post("/advertise", async (req, res) => {
      const { _id } = req.body;
      const isExist = await adCollection.findOne({ _id: _id });
      if (!isExist) {
        const result = await adCollection.insertOne(req.body);
        res.send({ message: "Ad Running successfully..", status: true });
      } else {
        return res.send({ message: "Item already exist", status: false });
      }
      // console.log(object);
    });
    app.get("/advertise", async (req, res) => {
      const result = await adCollection.find({}).toArray();
      res.send(result);
    });
    app.delete("/advertise/:id", async (req, res) => {
      const result = await adCollection.deleteOne({
        _id: req?.params?.id,
      });
      res.send(result);
    });
  } finally {
  }
};
run().catch(console.dir);

app.listen(port, () => console.log("Success.."));
