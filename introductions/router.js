const express = require("express");
const bodyParser = require("body-parser");
const { Introduction } = require("./models");
const { User } = require("../users/models");
const passport = require("passport");
const router = express.Router();
const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate("jwt", { session: false });

router.get("/all", (req, res) => {
    return Introduction.find()
        .sort("-createdAt")
        .populate("poster", "fullname")
        .then(review => res.status(200).json(review))
        .catch(err => res.status(500).json({ message: "Internal server error" }));
});

router.post("/", [jsonParser, jwtAuth], (req, res) => {
    console.log(req.user.email);
    User.findOne({ email: req.user.email })
        .populate("poster", "fullname")
        .then(user => {
            console.log(req.body);
            const { title, summary, topics } = req.body;
            Introduction.create({
                title: title,
                summary: summary,
                topics: topics
            })
                .then(intro => {
                    return res.status(201).json(intro);
                })
                .catch(err => {
                    console.log(err);
                    return res.status(500).json({ message: "Internal server error" });
                });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ message: "Internal server error" });
        });
});

module.exports = { router };
