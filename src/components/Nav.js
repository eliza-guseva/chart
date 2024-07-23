import React, {useContext, useEffect} from "react";
import { LoginContext } from "../context/LoginContext";
import { Link } from "react-router-dom";

const Profile = () => {
    const {isLoggedIn, toggleLogin} = useContext(LoginContext);


    // Debugging: Log isLoggedIn value
    useEffect(() => {
        console.log("isLoggedIn:", isLoggedIn);
    }, [isLoggedIn]);

    return (
            <ul className="LoginLogout">
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
        <nav className="navbar">
            <ul>
                <li>
                    <Link to ="/" className="NavLink">Home</Link>
                    </li>
                <li>
                     <Link to="/dashboard" className="NavLink">Dashboard</Link>
                </li>
                <li>
                    <Link to="/contact" className="NavLink">Contact</Link>
                </li>
            </ul>
            <Profile />
        </nav>
    );
}

export default Nav;