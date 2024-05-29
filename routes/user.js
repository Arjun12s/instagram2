const express = require("express");
const app = express();
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require("../middelwares/requireLogin");
const POST = mongoose.model("POST");
const USER = mongoose.model("USER");
const Chat = mongoose.model("Chat")
const Message = mongoose.model("Message")
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




/// ROUTER to Search for all users
router.get("/searchUsers", requireLogin, async (req, res) => {
    try {
        const keyword = req.query.search ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { userName: { $regex: req.query.search, $options: "i" } }
            ]
        } : {};

        const users = await USER.find(keyword).find({ _id: { $ne: req.user._id } });
        console.log(users)
        res.send(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.post(`/accesschat`, requireLogin, async (req, res) => {
    const { userId } = req.body
    if (!userId) {
        console.log("userId param not sent with request");
        return res.sendStatus(400);
    }
    var isChat = await Chat.find({
        isGroupChat: false, $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    }).populate("users", "-password -email")
        .populate("latestMessage")

    isChat = await USER.populate(isChat, {
        path: "latestMessage.sender", select: "name Photo userName",
    });
    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],

        };
        try {
            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password -email");
            res.status(200).send(fullChat)
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
})



router.get(`/fetchats`, requireLogin, async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password -email")
            .populate("groupAdmin", "-password -email")
            .populate("latestMessage", "-password")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await USER.populate(isChat, {
                    path: "latestMessage.sender", select: "name Photo userName",
                });
                res.status(200).send(results);


            })
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

router.post(`/createGrp`, requireLogin,async (req, res) =>{
    if(!req.body.users || !req.body.name){
        return res.status(400).send({message:"Please fill allthe fields"})

    }
    var users=JSON.parse(req.body.users)
    if(users.length<2){
        return res.status(400).send("there should be more than 2 users to create a group")
    }
    users.push(req.user)

    try {
        const grpChat=await Chat.create({
            chatName:req.body.name,
            users:users,
            isGroupChat:true,
            groupAdmin:req.user,
        })
        const fullGroupChat=await Chat.findOne({ _id: createdChat._id }).populate("users", "-password -email")
        .populate("groupAdmin", "-password -email");
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})
router.put(`/renameGrp`, requireLogin,requireLogin,async (req, res) =>{
    const {chatId,chatName}=req.body;
    const updatedChat=await Chat.findByIdAndUpdate(
        chatId,{
            chatName       },{
                new:true
            }
    ).populate("users", "-password -email")
    .populate("groupAdmin", "-password -email");

    if (!updatedChat) {
        res.status(404);
        throw new Error("chat not found")
    }
    else{
        res.json(updatedChat)
    }
})





router.put(`/removefromGrp`, requireLogin ,requireLogin,async (req, res) =>{
    const {chatId,userId}=req.body;

    const removed= await Chat.findByIdAndUpdate(chatId,{
        $pull:{users:userId},
        
    },{new:true}).populate("users", "-password -email")
    .populate("groupAdmin", "-password -email");

    if (!removed) {
        res.status(404);
        throw new Error("chat not found")
    }
    else{
        console.log(removed)
        res.json(removed)   
    }
})
router.put(`/addToGrp`, requireLogin,requireLogin,async (req, res) =>{
    const {chatId,userId}=req.body;

    const added= await Chat.findByIdAndUpdate(chatId,{
        $push:{users:userId},
        
    },{new:true}).populate("users", "-password -email")
    .populate("groupAdmin", "-password -email");

    if (!added) {
        res.status(404);
        throw new Error("chat not found")
    }
    else{
        console.log(added)
        res.json(added)   
    }
})






module.exports = router;