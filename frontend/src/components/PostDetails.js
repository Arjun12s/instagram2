import React from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../css/PostDetail.css";

export default function PostDetail({ item, toggleDetails }) {

    //toast function
    const notifyA = (msg) => toast.error(msg);
    const notifyB = (msg) => toast.success(msg);
    const navigate = useNavigate();

    const removePost = (postId) => {
        if (window.confirm("Do you really want to delete the Post?")) {
            fetch(`/deletePost/${postId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("jwt")
                },
            })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then((result) => {
                notifyB(result.msg);
                if (typeof toggleDetails === 'function') {
                    toggleDetails();
                } else {
                    console.error("toggleDetails is not a function");
                }
                notifyB("Post deleted sucessfully");
                navigate("/"); // Navigate to home page
                
            })
            .catch((error) => {
                notifyA("Error deleting post");
                console.error("Error deleting post:", error);
            });
        }
    };
    

    return (
        <div className="showComment">
            <div className="container">
                <div className="postPic">
                    <img src={item.photo} alt="" />
                </div>
                <div className="details">
                    <div className="card-header" style={{ borderBottom: "1px solid grey" }}>
                        <div className="card-pic">
                            <img src="https://images.unsplash.com/photo-1605909145192-c8e361e3eda7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDIwfFM0TUtMQXNCQjc0fHxlbnwwfHx8fHw%3D" alt="" />
                        </div>
                        <h5>{item.postedBy.name}</h5>
                        <div className="deletePost" onClick={() => { removePost(item._id) }}>
                            <span className="material-symbols-outlined">
                                delete
                            </span>
                        </div>
                    </div>
                    <div className="comment-section" style={{ borderBottom: "1px solid grey" }}>
                        {
                            item.comments.map((comment) => {
                                return (
                                    <p className="comm">
                                        <span className="commenter">{comment.postedBy.name} : </span>
                                        <span className="commentText"> {comment.comment}</span>
                                    </p>
                                );
                            })
                        }
                    </div>
                    <div className="card-content">
                        <p>{item.likes.length} likes</p>
                        <p>{item.body}</p>
                    </div>
                    <div className="add-comment" >
                        <span className="material-symbols-outlined">sentiment_satisfied</span>
                        <input type="text" placeholder="Add a comment...." />
                        <button className="comment">
                            Post
                        </button>
                    </div>
                </div>
            </div>
            <div className="close-Comment" onClick={() => { toggleDetails() }}>
                <span className="material-symbols-outlined">close</span>
            </div>
        </div>
    );
}
