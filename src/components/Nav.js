import React, {useContext, useEffect, useState} from "react";
import { LoginContext } from "../context/LoginContext";
import { Link } from "react-router-dom";

const Profile = () => {
    const {isLoggedIn, toggleLogin} = useContext(LoginContext);

    // Debugging: Log isLoggedIn value
    useEffect(() => {
        console.log("isLoggedIn:", isLoggedIn);
    }, [isLoggedIn]);
    
    return (
        <div className="navigation">
            <ul className="nav menu">
                <li className="nav top element">
                    <img className="menu icon"
                    src="/menu.png" alt="Navigation Menu"/>
                    <ul className="nav menu">
                    <li>
                        <Link to="/" className="NavLink">Home</Link>
                    </li>
                    <li>
                    <Link to="/contact" className="NavLink">Contact</Link>
                    </li>
                    </ul>
                </li>
                
                <li className="nav top element"><img className="user icon"
                    src="/user.png" 
                    alt="User Menu"
                />
                {isLoggedIn ? (
                    <ul className="user menu">
                        <li onClick>
                            <Link to="/dashboard" className="NavLink">Dashboard</Link>
                        </li>
                        <li onClick>
                            <Link to="/" className="NavLink">Log Out</Link>
                        </li>
                        </ul>
                    ) : (
                        <ul className="user menu">
                        <li>
                            <Link to="/login" className="NavLink">Log In</Link>
                        </li>
                        </ul>
                    )}
                </li>
            </ul>
        </div>
    )

    
    


    // return (
    //         <ul className="LoginLogout">
    //         {isLoggedIn ? (
    //             <li onClick={toggleLogin}>
    //                 <Link to="/" className="NavLink">Log Out</Link>
    //             </li>
    //         ) : (
    //             <li>
    //                 <Link to="/login" className="NavLink">Log In</Link>
    //             </li>
    //         )}
    //         </ul>
    // );
}

const Logo = () => {
    return (
        <div className="header logo">
            <div>
                <h3 className="header logo simbolic">Simbolic</h3>
            </div>
            <div>
                <h2 className="header logo charts"> Charts</h2>
            </div>
        </div>
    );
}

const NavBar = () => {
    return (
        <nav className="navbar">
            <Profile />
        </nav>
    );
}

const Nav = () => {
    return (
        <div className="header container">
            <Logo />
            <div><p className="header call">See your data</p></div>
            <NavBar />
        </div>
)};



export default Nav;