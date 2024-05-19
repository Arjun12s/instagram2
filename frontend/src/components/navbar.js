import React,{useContext} from "react";
import logo from "../image/logo.png"
import '../css/navbar.css'
import { Link } from "react-router-dom";
import { LoginContext } from "../context/loginContext";
export default function Navbar(login) {
    const {setModalOpen}=useContext(LoginContext)
    const loginStatus = () => {
        const token = localStorage.getItem("jwt")
        // console.log(token)
        if ( token||login) {
            return [
                <>
                    <Link to={'/profile'} ><li>Profile</li></Link>
                    <Link to={'/createPost'} ><li>Create Post</li></Link>
                    <Link to={'/followingpost'} ><li>Following</li></Link>
                    
                    <Link to={'/message'}><li>Message</li></Link>
                    <Link to={''}>
                        <button className="primaryBtn" onClick={()=>setModalOpen(true)}>Log Out</button>
                    </Link>
                    <Link to={"/notification"}><li>Notifications</li></Link>
                </>
            ]

        }
        else {
            return [
                <>
                    <Link to={'/signup'}><li>Sign-Up</li></Link>
                    <Link to={'/signin'}><li>Sign-In</li></Link>
                </>
            ]
        }
    };
    return (
        <div className="navbar">
            <img src={logo} alt="" key={{}}></img>
            <ul className="nav-menu">
                {
                    loginStatus()
                }
                </ul>
        </div>
        )


}
