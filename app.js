const express = require("express");
const bodyParser = require("body-parser");
const videoRoute = require("./videoRoutes");
const cors = require("cors");
const AWS = require("aws-sdk");

const app = express();
app.use(cors());
require("dotenv").config();
require("./db").connectToMongoDB(); // Connect to MongoDB

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

app.use(express.json());
const PORT = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return res.json({
    status: true,
    data: {
      documentationUrl:
        "https://documenter.getpostman.com/view/20062547/2s9XxtxFaR",
    },
  });
});

app.use("/api", videoRoute);

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});

module.exports = app;
