const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require("../middlewares/requireLogin");
const POST = mongoose.model("POST");
const USER = mongoose.model("USER");
const CONVERSATION = mongoose.model("CONVERSATION");
const MSG = mongoose.model("MSG");

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
        const post = await USER.findByIdAndUpdate(
            req.body.followId,
            { $push: { followers: req.user._id } },
            { new: true }
        ).exec();

        const user = await USER.findByIdAndUpdate(
            req.user._id,
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
        const post = await USER.findByIdAndUpdate(
            req.body.followId,
            { $pull: { followers: req.user._id } },
            { new: true }
        ).exec();

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

// ROUTER to Search for all users
router.get("/searchUsers", requireLogin, async (req, res) => {
    try {
        const keyword = req.query.search ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { userName: { $regex: req.query.search, $options: "i" } }
            ]
        } : {};

        const users = await USER.find({ ...keyword, _id: { $ne: req.user._id } });
        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a conversation or fetch existing one
// CREATE A CONVERSATION
router.post(`/conversation`, requireLogin, async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;

        // Check if a conversation already exists
        let conversation = await CONVERSATION.findOne({
            members: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = new CONVERSATION({ members: [senderId, receiverId] });
            await conversation.save();
        }

        res.status(200).json({ conversationId: conversation._id });
    } catch (error) {
        console.error("Error creating conversation:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET CONVERSATIONS FOR A USER
router.get(`/conversation/:userid`, requireLogin, async (req, res) => {
    try {
        const userId = req.params.userid;

        const conversations = await CONVERSATION.find({ members: userId });

        // Fetch user data along with each conversation
        const conversationUserData = await Promise.all(
            conversations.map(async (conversation) => {
                const receiverId = conversation.members.find((member) => member !== userId);
                const user = await USER.findById(receiverId).select("name email Photo");
                return { user, conversationId: conversation._id };
            })
        );

        res.status(200).json(conversationUserData);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Send a message
router.post('/message', requireLogin, async (req, res) => {
    try {
        const { conversationId, message } = req.body;
        const senderId = req.user._id;

        if (!senderId || !conversationId || !message) {
            return res.status(400).json({ error: 'Please provide senderId, conversationId, and message' });
        }

        const newMessage = new MSG({ conversationId, senderId, message });
        await newMessage.save();

        // res.status(200).json({  newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch messages for a conversation
router.get('/message/:conversationId', requireLogin, async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const messages = await MSG.find({ conversationId });

        if (!messages || messages.length === 0) {
            return res.status(404).json({ error: 'No messages found for this conversation' });
        }

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;
