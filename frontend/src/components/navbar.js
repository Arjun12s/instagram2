import React, { useContext } from "react";
import logo from "../image/logo.png"; // Ensure the correct path
import "../css/navbar.css"; // Ensure the correct path
import { Link } from "react-router-dom";
import { LoginContext } from "../context/loginContext";
import { AiFillMessage } from "react-icons/ai"; // Ensure the correct path

export default function Navbar({ login }) {
  const { setModalOpen } = useContext(LoginContext);

  const loginStatus = () => {
    const token = localStorage.getItem("jwt");
    if (login || token) {
      return (
        <>
          <Link to="/profile"><li key="profile">Profile</li></Link>
          <Link to="/createPost"><li key="createPost">Create Post</li></Link>
          <Link to="/followingpost"><li key="followingPost">Following</li></Link>
          <Link to="/message"><li key="message">Message</li></Link>
          <Link to="">
            <button className="primaryBtn" onClick={() => setModalOpen(true)}>Log Out</button>
          </Link>
          <Link to="/notification"><li key="notification">Notifications</li></Link>
        </>
      );
    } else {
      return (
        <>
          <Link to="/signup"><li key="signup">Sign-Up</li></Link>
          <Link to="/signin"><li key="signin">Sign-In</li></Link>
        </>
      );
    }
  };

  const loginStatusMobile = () => {
    const token = localStorage.getItem("jwt");
    if (login || token) {
      return (
        <>
          <div className="nav-top">
            <img src={logo} alt="logo" id="insta-logo" />
            <ul>
            <li className="notification"><Link to="/notification"><span className="material-symbols-outlined" style={{textDecoration:"none"}}>notifications</span></Link></li>
              <li className="msg"><Link to="/message"><AiFillMessage style={{ fontSize:"24px" }} /></Link></li>
              
            </ul>
          </div>


          <ul className="nav-bottom">
            <li key="home"><Link to="/"><span className="material-symbols-outlined">home</span></Link></li>
            <li key="profile"><Link to="/profile"><span className="material-symbols-outlined">person</span></Link></li>
            <li key="createPost"><Link to="/createPost"><span className="material-symbols-outlined">add</span></Link></li>
            <li key="followingPost"><Link to="/followingpost"><span className="material-symbols-outlined">explore</span></Link></li>
            <li key="logout" className="primaryBtn" onClick={() => setModalOpen(true)}><span className="material-symbols-outlined">logout</span></li>
          </ul>
        </>
      );
    } else {
      return (
        <>
          <Link to="/signup"><li key="signup">Sign-Up</li></Link>
          <Link to="/signin"><li key="signin">Sign-In</li></Link>
        </>
      );
    }
  };

  return (
    <div className="navbar">
      <ul className="nav-menu">
        {loginStatus()}
      </ul>
      <div className="nav-mobile">
        {loginStatusMobile()}
      </div>
    </div>
  );
}
