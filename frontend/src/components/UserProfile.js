import React, { useEffect, useState } from "react";
import "../css/Profile.css";
// import PostDetail from "./PostDetail";
import { useParams } from "react-router-dom";

export default function UserProfile() {
    // const piclink = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhcdVEzoVWLyCqD6wPIyxnxW3L2lYNzsmrGHK-A-tGxA&s';
  
    var picLink = "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg"
    const { userid } = useParams();
    const [user, setUser] = useState("");
    const [posts, setPosts] = useState([]);
    const [isfollow, setIsFollow] = useState(false);
    // TO FOLLOW USER 
    const followUser = (userId) => {
        fetch(`/follow`, {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                followId: userId
            })
        })
        .then((res) => res.json())  // Return the promise here
        .then((data) => {
            console.log(data);       // Now this will log the actual data
            setIsFollow(true);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };
    
    const unfollowUser = (userId) => {
        fetch(`/unfollow`, {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                followId: userId
            })
        })
        .then((res) => res.json())  // Return the promise here
        .then((data) => {
            console.log(data);       // Now this will log the actual data
            setIsFollow(false);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };
    

    useEffect(() => {
        fetch(`/user/${userid}`, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => res.json())
        .then((result) => {
            console.log(result)
            setUser(result.user);
            setPosts(result.posts);
            if(result.user.followers.includes(JSON.parse(localStorage.getItem("user"))._id)){
                setIsFollow(true)
            }
        })
        .catch(error => console.error("Error fetching user profile:", error));
    }, [
        isfollow
    ]);

    return (
        <div className="profile">
            <div className="profile-frame">
                <div className="profile-pic">
                <img src={user.Photo ? user.Photo : picLink} alt="" />
                </div>
                <div className="profile-data">
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <h1>{user.name}</h1>
                    <button className="followBtn"
                     onClick={()=>{
                        if(isfollow){
                        unfollowUser(user._id)
                    }else{
                        followUser(user._id)
                    }
                    }}
                    >
                       {isfollow ? "Unfollow":"Follow"}
                    </button>
                    </div>
                    
                    <div className="profile-info" style={{ display: "flex" }}>
                        <p>{posts.length} POSTS</p>
                        <p>{user.followers?user.followers.length:"0"} FOLLOWERS</p>
                        <p>{user.following?user.following.length:"0"} FOLLOWING</p>
                    </div>
                </div>
            </div>
            < hr style={{ width: "90%", margin: "15px auto", opacity: "0.8" }} />
            <div className="gallery">
                {posts && posts.map((pics) => (
                    <img key={pics._id} src={pics.photo} className="item" alt="Post" />
                ))}
            </div>
        </div>
    );
                }
