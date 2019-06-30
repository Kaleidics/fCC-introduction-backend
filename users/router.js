const express = require("express");
const bodyParser = require("body-parser");
const { User } = require("./models");
const router = express.Router();
const jsonParser = bodyParser.json();

// REGISTER NEW USER
router.post("/register", jsonParser, (req, res) => {
    const requiredFields = ["email", "password"];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: "ValidationError",
            message: "Missing field",
            location: missingField
        });
    }

    const stringFields = ["email", "password"];
    const nonStringField = stringFields.find(field => field in req.body && typeof req.body[field] !== "string");

    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: "ValidationError",
            message: "Incorrect field type: expected string",
            location: nonStringField
        });
    }

    const explicityTrimmedFields = ["email", "password"];
    const nonTrimmedField = explicityTrimmedFields.find(field => req.body[field].trim() !== req.body[field]);

    if (nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: "ValidationError",
            message: "Cannot start or end with whitespace",
            location: nonTrimmedField
        });
    }

    let { email, password, firstname, lastname, introduction } = req.body;

    return User.find({ email })
        .countDocuments()
        .then(count => {
            if (count > 0) {
                // There is an existing user with the same email
                return Promise.reject({
                    code: 422,
                    reason: "ValidationError",
                    message: "email already taken",
                    location: "email"
                });
            }
            // If there is no existing user, hash the password
            return User.hashPassword(password);
        })
        .then(hash => {
            return User.create({
                email,
                password: hash,
                firstname,
                lastname,
                introduction
            });
        })
        .then(user => {
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            if (err.reason === "ValidationError") {
                return res.status(err.code).json(err);
            }
            console.log(err);
            res.status(500).json({ code: 500, message: "Internal server error" });
        });
});

module.exports = { router };
