const router = require("express").Router();
const verify = require("./verifyToken");
const { articleValidation, commentValidation } = require("../validation");
const multer = require("multer");
const uuid = require("uuid");
const path = require("path");
const fs = require('fs')

const Article = require("../model/Article");
const User = require("../model/User");
const Users = require("../routes/users");
const Category = require("../model/Category");
const Categories = require("../routes/categories");
const Comment = require("../model/Comment");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/article-images/')
    },
    filename: function (req, file, cb) {
        cb(null, uuid.v4() + Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage: storage })

router.post("/", upload.single('image'), verify, async (req, res) => {
    const { error } = articleValidation(req.body);
    if (error) return res.status(400).send(error);

    const author = await Users.getUser(req.body.authorId, res);
    const category = await Categories.getCategory(req.body.categoryId, res);

    const path = "uploads/article-images/" + req.file.filename;
    const article = new Article({
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        article: req.body.article,
        author: author,
        category: category,
        imagePath: path
    });

    try {
        const savedArticle = await article.save();
        res.send(savedArticle);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get("/", async (req, res) => {
    const articles = await getArticles(res);

    if (req.query.n) {
        res.send(articles.slice(0, req.query.n));
    } else {
        res.send(articles);
    }
});

router.get("/:articleId", async (req, res) => {
    res.send(await getArticle(req.params.articleId, res));
});

router.delete("/:articleId", async (req, res) => {
    await deleteArticle(req.params.articleId, res);
    res.send({ "deleted": req.params.articleId });
});

router.get("/user/:userId", async (req, res) => {
    const art = getArticles(res);

    let arts = [];
    for (let i = 0; i < art.length; i++) {
        if (art[i].author._id == req.params.userId) {
            arts.push(art[i])
        }
    }

    res.send(arts);
});

router.get("/img/:articleId", async (req, res) => {
    const art = await getArticle(req.params.articleId, res);
    res.sendFile(path.join(__dirname, "/../" + art.imagePath));
});

router.post("/:userId/like/:articleId", verify, async (req, res) => {
    const art = await getArticle(req.params.articleId, res);
    const us = await Users.getUser(req.params.userId, res);

    let update = true;
    if (art.likes.length > 0) {
        art.likes.forEach(element => {
            if (element.id == us.id) {
                update = false;
            }
        });
    }

    let id = req.params.articleId
    if (update) {
        Article.findOneAndUpdate({ _id: id }, {
            $push: {
                likes: us
            }
        },
            function (err, numAffected, raw) {
                if (err) {
                    res.send(err);
                }
            }
        );
    } else {
        await Article.findOneAndUpdate({ _id: id }, {
            $pullAll: {
                likes: [us]
            }
        },
            function (err, numAffected, raw) {
                if (err) {
                    res.send(err);
                }
            }
        );
    }

    update = false;
    if (art.dislikes.length > 0) {
        art.dislikes.forEach(async (element) => {
            if (element.id == us.id) {
                update = true;
            }
        });
    }

    if (update) {
        await Article.findOneAndUpdate({ _id: id }, {
            $pullAll: {
                dislikes: [us]
            }
        },
            function (err, numAffected, raw) {
                if (err) {
                    console.log(err);
                    res.send(err);
                }
            }
        );
    }

    res.send(await getArticle(req.params.articleId, res));
});

router.post("/:userId/dislike/:articleId", verify, async (req, res) => {
    const art = await getArticle(req.params.articleId, res);
    const us = await Users.getUser(req.params.userId, res);

    let update = true;

    if (art.dislikes.length > 0) {
        art.dislikes.forEach(element => {
            if (element.id == us.id) {
                update = false;
            }
        });
    }

    let id = req.params.articleId
    if (update) {
        Article.findOneAndUpdate({ _id: id }, {
            $push: {
                dislikes: us
            }
        },
            function (err, numAffected, raw) {
                if (err) {
                    res.send(err);
                }
            }
        );
    } else {
        await Article.findOneAndUpdate({ _id: id }, {
            $pullAll: {
                dislikes: [us]
            }
        },
            function (err, numAffected, raw) {
                if (err) {
                    res.send(err);
                }
            }
        );
    }

    update = false;
    if (art.likes.length > 0) {
        art.likes.forEach(async (element) => {
            if (element.id == us.id) {
                update = true;
            }
        });
    }

    if (update) {
        await Article.findOneAndUpdate({ _id: id }, {
            $pullAll: {
                likes: [us]
            }
        },
            function (err, numAffected, raw) {
                if (err) {
                    console.log(err);
                    res.send(err);
                }
            }
        );
    }

    res.send(await getArticle(req.params.articleId, res));
});

router.get("/category/:catId", async (req, res) => {
    const cat = await Categories.getCategory(req.params.catId, res);

    let articles = await Article.find({ category: cat });

    if (req.query.n) {
        res.send(articles.slice(0, req.query.n));
    } else {
        res.send(articles);
    }
});

router.post("/:userId/comment/:articleId", verify, async (req, res) => {
    const art = await getArticle(req.params.articleId, res);

    const us = await Users.getUser(req.params.userId, res);

    const comment = new Comment({
        comment: req.body.comment,
        user: us
    });

    await Article.findOneAndUpdate({ _id: req.params.articleId }, {
        $push: {
            comments: comment
        }
    });

    res.send(await getArticle(req.params.articleId, res));
});

router.get("/:articleId/comments/", async (req, res) => {
    const art = await getArticle(req.params.articleId, res);
    res.send(art.comments);
});

router.get("/bestarticles/:categoryId", async (req, res) => {
    if (req.params.categoryId === "all") {
        let articles = await getArticles(res);
        if (articles.length < req.query.n) return res.status(404).send("There is not enought articles!");

        articles.sort(compare);
        res.send(articles.slice(0, req.query.n));
    } else {
        const category = await Categories.getCategory(req.params.categoryId, res);

        let articles = await Article.find({ category: category });
        if (articles.length < req.query.n) return res.status(404).send("There is not enought articles!");

        articles.sort(compare);
        res.send(articles.slice(0, req.query.n));
    }
});

async function getArticles(res) {
    const articles = await Article.find();

    if (articles) {
        return articles;
    } else {
        if (res) {
            res.status(404).send("There is no articles!");
        } else {
            console.error("There is no articles!");
        }
    }
}

async function getArticle(id, res) {
    const article = await Article.findOne({ _id: id });

    if (article) {
        return article;
    } else {
        if (res) {
            res.status(404).send("Article with that ID doesn't exist!");
        } else {
            console.error("Article with that ID doesn't exist!");
        }
    }
}

async function deleteArticle(id, res) {
    const article = await Article.findOneAndDelete({ _id: id });

    if (article) {
        try {
            fs.unlinkSync(article.imagePath);
            console.info("Deleted image: " + article.imagePath);
        } catch (err) {
            console.error(err)
            res.status(400).send(err);
        }

        return;
    } else {
        if (res) {
            res.status(404).send("Article with that ID doesn't exist!");
        } else {
            console.error("Article with that ID doesn't exist!");
        }
    }
}

module.exports = router;
module.exports.getArticles = getArticles;
module.exports.getArticle = getArticle;

function compare(a, b) {
    const aScore = a.likes.length - a.dislikes.length;
    const bScore = b.likes.length - b.dislikes.length;

    if (aScore > bScore) {
        return -1;
    }
    if (aScore < bScore) {
        return 1;
    }
    return 0;
}