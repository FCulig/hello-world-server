const mongoose = require("mongoose");
const User = require("./User");

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        required: true
    },
    article: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    author: {
        type: User,
        required: true
    }
});

module.exports = mongoose.model("Article", articleSchema);