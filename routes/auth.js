const router = require("express").Router();
const User = require("../model/User");
const { registerValidation, loginValidation } = require("../validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async(req, res) => {
    //validacija requesta
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error);

    //provjera je li taj user vec u db
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
        return res.status(400).send("Email already exists!");
    }
    //TODO:dodaj za username i ostale

    //hashiranje passworda
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //kreiranje usera
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword
    });

    try {
        const savedUser = await user.save();
        res.send({ success: 1 });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post("/login", async(req, res) => {
    
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error + " " + req.body);

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).send("Invalid email or password!");
    }

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
        return res.status(400).send("Invalid email or password!");
    }

    const token = jwt.sign({
            _id: user._id,
            expires: Math.floor(Date.now() / 1000) + 60 * 60
        },
        process.env.TOKEN_SECRET
    );

    res
        .header("auth-token", token)
        .send({ "token": token, "username": user.name, "email": user.email, "id": user._id, "role":user.role });
});

module.exports = router;