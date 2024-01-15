const path = require("path");

const express = require("express");

const bodyParser = require("body-parser");

const postRoutes = require("./routes/posts");

const userRoutes = require("./routes/user");

const mongoose = require("mongoose");

const app = express();

mongoose
  .connect(
    "mongodb+srv://rakesh:"+ process.env.MONGO_ATLAS_PW +"@atlascluster.sa1inj8.mongodb.net/"
  )
  .then(() => {
    console.log("Connection Successful");
  })
  .catch(() => {
    console.log("Connection Failed");
  });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts", postRoutes);

app.use("/api/user", userRoutes);

module.exports = app;
