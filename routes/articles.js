const router = require("express").Router();
const verify = require("./verifyToken");
const { articleValidation } = require("../validation");

const Article = require("../model/Article");
const User = require("../model/User");

router.post("/", async(req, res) => {
    //validacija requesta
    const { error } = articleValidation(req.body);
    if (error) return res.status(400).send(error);

    const author = User.findById(req.body.authorId);
    if (!author) return res.status(404).send("User with that ID does not exist!");

    const article = new Article({
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        article: req.body.article,
        author: author
    });

    try {
        const savedArticle = await article.save();
        res.send(savedArticle);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get("/", async(req, res) => {
    const articles = await Article.find();
    res.send(articles);
});

router.post("/:userId/like/:articleId", verify, async(req, res) => {
    const art = await Article.findById(req.param.articleId);
    if (!art) {
        res.send(404).statusMessage("Article with this id doesn't exist");
    }

    const us = await User.findById(req.param.userId);
    if (!us) {
        res.send(404).statusMessage("User with this id doesn't exist");
    }

    Article.update({ id: req.param.articleId }, {
        $push: {
            likes: us
        }
    });

    res.send("LIKED");
});

module.exports = router;