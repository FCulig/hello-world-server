const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

//connect to db
mongoose.connect(
    process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log("connected to db")
);

//Route import
const authRoute = require("./routes/auth");
const posts = require("./routes/posts");

app.use(express.json());

//svi iz auth routea imaju prefix /api/user/
app.use("/api/user", authRoute);
app.use("/", posts);
app.use("/public", posts);

app.listen(3000, () => console.log("Server running"));