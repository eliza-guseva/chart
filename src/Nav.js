import React, {useContext, useEffect} from "react";
import { LoginContext } from "./context/LoginContext";
import { Link } from "react-router-dom";

const Profile = () => {
    const {isLoggedIn, toggleLogin} = useContext(LoginContext);


    // Debugging: Log isLoggedIn value
    useEffect(() => {
        console.log("isLoggedIn:", isLoggedIn);
    }, [isLoggedIn]);

    return (
            <ul>
            {isLoggedIn ? (
                <li onClick={toggleLogin}>
                    <Link to="/" className="NavLink">Log Out</Link>
                </li>
            ) : (
                <li>
                    <Link to="/login" className="NavLink">Log In</Link>
                </li>
            )}
            </ul>
    );
}

const Nav = () => {
    return (
        <nav >
        <div  className="navbar">
            <ul>
                <li>Home</li>
                <li>About</li>
                <li>Contact</li>
            </ul>
            <Profile />
        </div>
        </nav>
    );
}

export default Nav;