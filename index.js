const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

//connect to db
mongoose.connect(
    process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log("connected to db")
);
mongoose.set('useFindAndModify', false);
//Route import
const authRoute = require("./routes/auth");
const articles = require("./routes/articles");
const users = require("./routes/users");
const categories = require("./routes/categories");

app.use(express.json());

app.use(cors()); // include before other routes

//svi iz auth routea imaju prefix /api/user/
app.use("/api/auth", authRoute);
app.use("/api/users", users);
app.use("/api/articles", articles);
app.use("/api/categories", categories);

app.listen(3000, () => console.log("Server running"));