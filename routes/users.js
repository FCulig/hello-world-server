const router = require("express").Router();
const verify = require("./verifyToken");
const User = require("../model/User");

router.get('', verify, async (req, res) => {
    res.send(await getUsers(res));
});

router.get('/:userId', async (req, res) => {
    res.send(await getUser(req.params.userId, res));
});

router.delete('/:userId', verify, async (req, res) => {
    await deleteUser(req.params.userId, res);
    res.send({ "deleted": req.params.userId });
});

router.post('/writer/promote/:userId', verify, async (req, res) => {
    const us = getUser(req.params.userId, res);

    if (us.role === "WRITER") return res.status(400).send("User is already writer!");

    User.update({ _id: req.params.userId }, { role: "WRITER" }, function (err, numberAffected, rawResponse) {
        console.error(err);
        res.status(400).send(err)
    })

    res.send({ "promoted": req.params.userId });
});

router.post('/writer/demote/:userId', verify, async (req, res) => {
    const us = getUser(req.params.userId, res);

    if (us.role === "USER") return res.status(400).send("User already has role USER!");

    User.update({ _id: req.params.userId }, { role: "USER" }, function (err, numberAffected, rawResponse) {
        console.error(err);
        res.status(400).send(err)
    })
    res.send({ "demoted": req.params.userId });
});

async function getUsers(res) {
    const users = await User.find();

    if (users) {
        return users;
    } else {
        if (res) {
            res.status(404).send("User with that ID doesn't exist!");
        } else {
            console.error("User with that ID doesn't exist!");
        }
    }
}

async function getUser(userId, res) {
    const user = await User.findOne({ _id: userId });

    if (user) {
        return user;
    } else {
        if (res) {
            res.status(404).send("User with that ID doesn't exist!");
        } else {
            console.error("User with that ID doesn't exist!");
        }
    }

}

async function deleteUser(userId, res) {
    const user = await User.findOneAndDelete({ _id: req.params.userId });

    if (user) {
        return user;
    } else {
        if (res) {
            res.status(404).send("User with that ID doesn't exist!");
        } else {
            console.error("User with that ID doesn't exist!");
        }
    }
}

module.exports = router;
module.exports.getUser = getUser;
module.exports.getUsers = getUsers;
module.exports.deleteUser = deleteUser;