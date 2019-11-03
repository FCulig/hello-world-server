const mongoose = require("mongoose");

const User = require("./User");
const Category = require("./Category");
const Comment = require("./Comment");

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: Category.schema,
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
    imagePath: {
        type: String,
        required: true
    },
    likes: [User.schema],
    dislikes: [{
        type: User.schema,
        default: []
    }],
    comments: [Comment.schema]
});

module.exports = mongoose.model("Article", articleSchema);