const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const IntroductionSchema = mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
    poster: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    summary: String,
    topics: Array
});

IntroductionSchema.methods.serialize = function() {
    return {
        title: this.title || "",
        summary: this.summary || "",
        topics: this.topics || []
    };
};

const Introduction = mongoose.model("Introduction", IntroductionSchema);

module.exports = { Introduction };
