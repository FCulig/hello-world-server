const router = require("express").Router();

const Category = require("../model/Category");

router.get('', async (req, res) => {
    res.send(await getAllCategories());
});

router.post('/', async (req, res) => {
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

async function getAllCategories(res) {
    const categories = await Category.find();

    if (categories) {
        return categories;
    } else {
        if (res) {
            res.status(404).send("User with that ID doesn't exist!");
        } else {
            console.error("User with that ID doesn't exist!");
        }
    }
}

async function getCategory(id, res) {
     const category = await Category.findOne({ _id: id });

    if (category) {
        return category;
    } else {
        if (res) {
            res.status(404).send("User with that ID doesn't exist!");
        } else {
            console.error("User with that ID doesn't exist!");
        }
    }
}

module.exports = router;
module.exports.getAllCategories = getAllCategories;
module.exports.getCategory = getCategory;