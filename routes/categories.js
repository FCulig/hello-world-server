const router = require("express").Router();
const verify = require("./verifyToken");
const { categoryValidation } = require("../validation");

const Category = require("../model/Category");

router.get('', async(req, res) => {
    const categories = await Category.find();
    res.send(categories);
});

router.post('/', async(req, res) => {
    const cat = await Category.findOne({ name: req.body.name });
    if (cat) return res.status(400).send("Category already exists!");

    const category = new Category({
        name: req.body.name
    });

    try {
        const savedCategory = await category.save();
        res.send(savedCategory);
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;