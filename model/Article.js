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
        default: Date.now
    },
    author: {
        type: User.schema,
        required: true
    },
    likes: {
        type: User.schema,
        default: []
    },
    dislikes: {
        type: User.schema,
        default: []
    }
});

module.exports = mongoose.model("Article", articleSchema);