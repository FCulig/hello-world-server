const router = require("express").Router();
const verify = require("./verifyToken");
const User = require("../model/User");

router.get('', verify, async(req, res) => {
    let users = await User.find();
    res.send(users);
});

router.get('/:userId', verify, async(req, res) => {
    let user = await User.findOne({ _id: req.params.userId });
    console.log(user);
    res.send(user);
});


router.post('/writer/promote', verify, async(req, res) => {
    User.update({ email: req.body.email }, { role: "WRITER" }, function(err, numberAffected, rawResponse) {
        //fn ako je uspjesna promjena
        console.log("ERROR: promocija usera");
        console.log(err);
        console.log(numberAffected);
        console.log(rawResponse);
    })
    res.send(req.body.email);
});

router.post('/writer/demote', verify, async(req, res) => {
    User.update({ email: req.body.email }, { role: "USER" }, function(err, numberAffected, rawResponse) {
        //fn ako je uspjesna promjena
        console.log("ERROR: promocija usera");
        console.log(err);
        console.log(numberAffected);
        console.log(rawResponse);
    })
    res.send(req.body.email);
});

module.exports = router;