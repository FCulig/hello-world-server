const router = require("express").Router();
const verify = require("./verifyToken");

router.get('/', verify, (req, res) => {
    res.json({
        posts: {
            title: "private"
        }
    })
})

router.get('/public', (req, res) => {
    res.json({
        posts: {
            title: "public"
        }
    })
})


module.exports = router;