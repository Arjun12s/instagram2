import React, { useContext } from "react";
import logo from "../image/logo.png"; // Ensure the correct path
import "../css/navbar.css"; // Ensure the correct path
import { Link } from "react-router-dom";
import { LoginContext } from "../context/loginContext"; // Ensure the correct path

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

  return (
    <div className="navbar">
      <img src={logo} alt="logo" />
      <ul className="nav-menu">
        {loginStatus()}
      </ul>
    </div>
  );
}
