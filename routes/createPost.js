const express = require("express");
const app = express();
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middelwares/requireLogin");
const cors = require("cors");
const POST = mongoose.model("POST");

app.use(cors());

// ROUTER to GET all THE posts AT HOME PAGE
router.get("https://www.elightevents.com/https://www.elightevents.com/allposts", requireLogin, (req, res) => {
    POST.find()
        .populate("postedBy", "_id name Photo")
        .populate("comments.postedBy", "_id name")
        .sort("-createdAt")
        .then(posts => res.json(posts))
        .catch(err => console.log(err));
});

// ROUTER to CREATE THE posts
router.post("https://www.elightevents.com/https://www.elightevents.com/createPost", requireLogin, (req, res) => {
    const { body, pic } = req.body;
    if (!body || !pic) {
        return res.status(422).json({ error: "Please fill all the fields" });
    }

    const post = new POST({
        body,
        photo: pic,
        postedBy: req.user
    });

    post.save()
        .then(result => res.json({ post: result }))
        .catch(err => {
            console.log(err);
            return res.status(500).json({ error: "Internal server error" });
        });
});

// ROUTER to GET my posts
router.get("https://www.elightevents.com/https://www.elightevents.com/myposts", requireLogin, (req, res) => {
    POST.find({ postedBy: req.user._id })
        .populate("postedBy", "_id name Photo")
        .populate("comments.postedBy", "_id name")
        .sort("-createdAt")
        .then(myposts => res.json(myposts))
        .catch(err => console.log(err));
});

// ROUTER to GET like counts
router.put("https://www.elightevents.com/https://www.elightevents.com/like", requireLogin, (req, res) => {
    POST.findByIdAndUpdate(req.body.postId, {
        $push: { likes: req.user._id }
    }, {
        new: true
    }).populate("postedBy", "_id name Photo")
        .populate("comments.postedBy", "_id name")
        .then(result => res.json(result))
        .catch(err => {
            console.log(err);
            return res.status(422).json({ error: err });
        });
});

// ROUTER to GET unlike counts
router.put("https://www.elightevents.com/https://www.elightevents.com/unlike", requireLogin, (req, res) => {
    POST.findByIdAndUpdate(req.body.postId, {
        $pull: { likes: req.user._id }
    }, {
        new: true
    }).populate("postedBy", "_id name Photo")
        .populate("comments.postedBy", "_id name")
        .then(result => res.json(result))
        .catch(err => {
            console.log(err);
            return res.status(422).json({ error: err });
        });
});


// ROUTER to POST a comment
router.put("https://www.elightevents.com/https://www.elightevents.com/comment", requireLogin, (req, res) => {
    const comment = {
        comment: req.body.text,
        postedBy: req.user._id
    };

    POST.findByIdAndUpdate(req.body.postId, {
        $push: { comments: comment }
    }, {
        new: true
    })
    .populate("comments.postedBy", "_id name")
    
    .populate("postedBy", "_id name Photo")
    .then(result => {
        if (!result) {
            return res.status(422).json({ error: "Post not found" });
        }
        res.json(result);
    })
    .catch(err => {
        console.log(err);
        return res.status(422).json({ error: "Error adding comment" });
    });
});




// API TO DELETE POST
router.delete("https://www.elightevents.com/https://www.elightevents.com/deletePost/:postId", requireLogin, (req, res) => {
    POST.findOne({ _id: req.params.postId })
        .populate("postedBy", "_id")
        .then(post => {
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            if (post.postedBy._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: "You are not authorized to delete this post" });
            }

            POST.deleteOne({ _id: req.params.postId })
                .then(() => res.json({ message: "Successfully Deleted" }))
                .catch(err => {
                    console.log(err);
                    return res.status(500).json({ error: "Could not delete post" });
                });
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ error: "Server Error" });
        });
});

// API TO SHOW POSTS OF PEOPLE I AM FOLLOWING
router.get("https://www.elightevents.com/https://www.elightevents.com/myfollowingpost", requireLogin, (req, res) => {
    POST.find({ postedBy: { $in: req.user.following } })
        .populate("postedBy", "_id name Photo")
        .populate("comments.postedBy", "_id name")
        .then(posts => res.json(posts))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        });
});









// // ROUTER to POST a MESSAGE
// router.put("https://www.elightevents.com/https://www.elightevents.commessage", requireLogin, (req, res) => {
//     const message = {
//         message: req.body.text,
//         sentBy: req.user._id
//     };

//     POST.findByIdAndUpdate(req.body.postId, {
//         $push: { messages: message }
//     }, {
//         new: true
//     })
//     .populate("messages.sentBy", "_id name")
    
//     .populate("sentBy", "_id name Photo")
//     .then(result => {
//         if (!result) {
//             return res.status(422).json({ error: "Post not found" });
//         }
//         res.json(result);
//     })
//     .catch(err => {
//         console.log(err);
//         return res.status(422).json({ error: "Error adding comment" });
//     });
// });




module.exports = router;