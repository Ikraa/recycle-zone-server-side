const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, Db } = require("mongodb");
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 4000;
///recycle_zone
//djEKnlc0dBEh03tI
app.get("/", (req, res) => {
  res.send("Welcome to Ikra's recycle zone server...:)");
});

const uri =
  "mongodb+srv://recycle_zone:djEKnlc0dBEh03tI@cluster0.kzsxnqy.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const userCollection = client.db("recycle_zone").collection("users");
    //save user info to database
    app.put("/user", async (req, res) => {
      const info = req.body;
      console.log(info);
      const result = await userCollection.updateOne(
        { email: info.email },
        { $set: info },
        { upsert: true }
      );
      res.send(result);
    });

    //Check account type
    app.get("/admin/:email", async (req, res) => {
      console.log(req.params.email);
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
  } finally {
  }
};
run().catch(console.dir);

app.listen(port, () => console.log("Success.."));
