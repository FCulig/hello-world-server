const router = require("express").Router();
const verify = require("./verifyToken");
const { articleValidation, commentValidation } = require("../validation");
const multer = require("multer");
const uuid = require("uuid");
const path = require("path");

const Article = require("../model/Article");
const User = require("../model/User");
const Category = require("../model/Category");
const Comment = require("../model/Comment");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/article-images/')
    },
    filename: function(req, file, cb) {
        cb(null, uuid.v4() + Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage: storage })

//TODO: zastita endpointa
router.post("/", upload.single('image'), async(req, res) => {
    const { error } = articleValidation(req.body);
    if (error) return res.status(400).send(error);

    const author = await User.findOne({ _id: req.body.authorId });
    if (!author) return res.status(404).send("User with that ID does not exist!");

    const category = await Category.findOne({ _id: req.body.categoryId });
    if (!category) return res.status(404).send("Category with that ID does not exist!");

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

router.get("/", async(req, res) => {
    const articles = await Article.find();
    res.send(articles);
});

router.get("/:articleId", async(req, res) => {
    const art = await Article.findOne({ _id: req.params.articleId });
    if (!art) {
        res.sendStatus(404);
    }

    res.send(art);
});

router.get("/img/:articleId", async(req, res) => {
    const art = await Article.findOne({ _id: req.params.articleId });
    if (!art) {
        res.sendStatus(404);
    }
    res.sendFile(path.join(__dirname, "/../"+art.imagePath));
});

router.get("/top", async(req, res) => {
    console.log(req.query.n);
    console.log(req.query.cat);

    const category = await Category.findOne({ _id: req.query.cat });
    if (!category) return res.status(404).send("Category with that ID does not exist!");

    let articles = await Article.find({ category: category });
    if (articles.length < req.query.n) return res.status(404).send("There is not enought articles!");

    articles.sort(compare);

    res.send(articles.slice(0, req.query.n));
});

router.post("/:userId/like/:articleId", verify, async(req, res) => {
    const art = await Article.findOne({ _id: req.params.articleId });
    if (!art) {
        res.sendStatus(404);
    }

    const us = await User.findById({ _id: req.params.userId });
    if (!us) {
        res.sendStatus(404);
    }

    let update = true;

    if (art.likes.length > 0) {
        art.likes.forEach(element => {
            console.log(element);
            if (element.id == us.id) {
                update = false;
            }
        });
    }

    //NOTICE: ne diraj
    let id = req.params.articleId
    if (update) {
        Article.findOneAndUpdate({ _id: id }, {
                $push: {
                    likes: us
                }
            },
            function(err, numAffected, raw) {
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
            function(err, numAffected, raw) {
                if (err) {
                    res.send(err);
                }
            }
        );
    }

    update = false;
    if (art.dislikes.length > 0) {
        art.dislikes.forEach(async(element) => {
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
            function(err, numAffected, raw) {
                if (err) {
                    console.log(err);
                    res.send(err);
                }
            }
        );
    }

    const arti = await Article.findOne({ _id: req.params.articleId });
    res.send(arti);
});

router.post("/:userId/dislike/:articleId", verify, async(req, res) => {
    const art = await Article.findOne({ _id: req.params.articleId });
    if (!art) {
        res.sendStatus(404);
    }

    const us = await User.findById({ _id: req.params.userId });
    if (!us) {
        res.sendStatus(404);
    }

    let update = true;

    if (art.dislikes.length > 0) {
        art.dislikes.forEach(element => {
            console.log(element);
            if (element.id == us.id) {
                update = false;
            }
        });
    }

    //NOTICE: ne diraj
    let id = req.params.articleId
    if (update) {
        Article.findOneAndUpdate({ _id: id }, {
                $push: {
                    dislikes: us
                }
            },
            function(err, numAffected, raw) {
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
            function(err, numAffected, raw) {
                if (err) {
                    res.send(err);
                }
            }
        );
    }

    update = false;
    if (art.likes.length > 0) {
        art.likes.forEach(async(element) => {
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
            function(err, numAffected, raw) {
                if (err) {
                    console.log(err);
                    res.send(err);
                }
            }
        );
    }

    const arti = await Article.findOne({ _id: req.params.articleId });
    res.send(arti);
});

router.get("/category/:catId", async(req, res) => {
    const cat = await Category.findOne({ _id: req.params.catId });
    if (!cat) return res.status(404).send("Category does not exists!");

    let articles = await Article.find({ category: cat });
    
    res.send(articles);
});


module.exports = router;

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