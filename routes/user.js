const express = require("express");
const app = express();
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require("../middelwares/requireLogin");
const POST = mongoose.model("POST");
const USER = mongoose.model("USER");
// const cors = require('cors');
// app.use(cors());
// const user=USER
// TO GET USER PROFILE 
router.get("/user/:id", (req, res) => {
    USER.findOne({ _id: req.params.id })
        .select("-password -email")
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            POST.find({ postedBy: req.params.id })
                .populate("postedBy", "_id")
                .then(posts => {
                    res.status(200).json({ user, posts });
                })
                .catch(err => {
                    return res.status(422).json({ error: err });
                });
        })
        .catch(err => {
            return res.status(404).json({ error: "User not found" });
        });
});


// FOLLOW USER
router.put("/follow", requireLogin, async (req, res) => {
    try {
        // Update the Post document to add follower
        const post = await USER.findByIdAndUpdate(
            req.body.followId,
            // console.log({followers: req.user._id }),
            { $push: { followers: req.user._id } },
            { new: true }
        ).exec();

        // Update the current user's following list
        const user = await USER.findByIdAndUpdate(
            req.user._id,
            // console.log({following: req.body.followId }),
            { $push: { following: req.body.followId } },
            { new: true }
        ).exec();

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// UNFOLLOW USER
router.put("/unfollow", requireLogin, async (req, res) => {
    try {
        // Update the Post document to remove follower
        const post = await USER.findByIdAndUpdate(
            req.body.followId,
            { $pull: { followers: req.user._id } },
            { new: true }
        ).exec();

        // Update the current user's following list
        const user = await USER.findByIdAndUpdate(
            req.user._id,
            { $pull: { following: req.body.followId } },
            { new: true }
        ).exec();

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// TO UPLOAD PROFILE PIC
router.put("/uploadProfilePic", requireLogin, (req, res) => {
    USER.findByIdAndUpdate(
        req.user._id,
        { $set: { Photo: req.body.pic } },
        { new: true }
    )
    .then(result => {
        res.json(result);
    })
    .catch(err => {
        return res.status(422).json({ error: err });
    });
});





module.exports = router;
