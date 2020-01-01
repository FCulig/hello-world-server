const router = require("express").Router();
const verify = require("./verifyToken");
const User = require("../model/User");

router.get('', verify, async(req, res) => {
    let users = await User.find();
    res.send(users);
});

router.get('/:userId', async(req, res) => {
    let user = await User.findOne({ _id: req.params.userId });
    res.send(user);
});

router.delete('/:userId', verify, async(req, res) => {

    const us = await User.findOneAndDelete({ _id: req.params.userId });
    if (!us) return res.status(404).send("User with that ID does not exist!");

    res.send({"deleted": req.params.userId});
});

router.post('/writer/promote/:userId', verify, async(req, res) => {

    const us = await User.findOne({ _id: req.params.userId });
    if (!us) return res.status(404).send("User with that ID does not exist!");
    
    if (us.role === "WRITER") return res.status(400).send("User is already writer!");

    User.update({ _id: req.params.userId }, { role: "WRITER" }, function(err, numberAffected, rawResponse) {
        console.log(err);
    })

    res.send({"promoted": req.params.userId});
});

router.post('/writer/demote/:userId', verify, async(req, res) => {

    const us = await User.findOne({ _id: req.params.userId });
    if (!us) return res.status(404).send("User with that ID does not exist!");

    if (us.role === "USER") return res.status(400).send("User already has role USER!");

    User.update({ _id: req.params.userId }, { role: "USER" }, function(err, numberAffected, rawResponse) {
        console.log(err);
    })
    res.send({"demoted": req.params.userId});
});

module.exports = router;