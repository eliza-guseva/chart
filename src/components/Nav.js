import React, {useContext, useEffect, useState} from "react";
import { LoginContext } from "../context/LoginContext";
import { Link } from "react-router-dom";


function closeMenu(event, isOpen, toggleDropdown) {
    if (isOpen) {
        toggleDropdown();
    }
}

function closeMenuAndLogout(event, isOpen, toggleDropdown, toggleLogin) {
    toggleLogin();
    closeMenu(event, isOpen, toggleDropdown);
    
}

function genLink(to, name, isOpen, toggleDropdown) {
    return (
        <Link to={to} className="NavLink" onClick={(event) => closeMenu(event, isOpen, toggleDropdown)}>
            {name}
        </Link>

    )

}

const NavMenu = ({ isOpen, toggleDropdown }) => {
    return ( <li className="nav top element" >
        <img className="menu icon" onClick={toggleDropdown}
        src="/menu.png" alt="Navigation Menu"/>
        <ul className={`nav menu ${isOpen ? 'show' : ''}`}>
        <li>
            {genLink("/", "Home", isOpen, toggleDropdown)}
        </li>
        <li>
            {genLink("/thegraphs", "Parse data", isOpen, toggleDropdown)}
        </li>
        <li>
            {genLink("/contact", "Contact", isOpen, toggleDropdown)}
        </li>
        </ul>
    </li>)}

const UserMenu = ({ isOpen, toggleDropdown }) => {
    const {isLoggedIn, toggleLogin} = useContext(LoginContext);

    return (
    <li className="nav top element">
        <img className="user icon" onClick={toggleDropdown}
            src="/user.png" 
            alt="User Menu"
        />
    {isLoggedIn ? (
        <ul className={`nav menu ${isOpen ? 'show' : ''}`} >
            <li>
                {genLink("/dashboard", "Dashboard", isOpen, toggleDropdown)}
            </li>
            <li>
                <Link to="/" className="NavLink" 
                onClick={(event) => closeMenuAndLogout(event, isOpen, toggleDropdown, toggleLogin)}
                >Log Out</Link>
            </li>
            </ul>
        ) : (
            <ul className={`nav menu ${isOpen ? 'show' : ''}`}>
            <li>
                {genLink("/login", "Login", isOpen, toggleDropdown)}
            </li>
            </ul>
        )}
    </li>)
}


const Menus = () => {
    const {isLoggedIn, toggleLogin} = useContext(LoginContext);
    const [openMenu, setOpenMenu] = useState(null);

    const toggleDropdown = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    // Debugging: Log isLoggedIn value
    useEffect(() => {
        console.log("isLoggedIn:", isLoggedIn);
    }, [isLoggedIn]);
    
    return (
        <div className="navigation">
            <ul className="nav menu">
            <NavMenu isOpen={openMenu === 'nav'} toggleDropdown={() => toggleDropdown('nav')} />
            <UserMenu isOpen={openMenu === 'user'} toggleDropdown={() => toggleDropdown('user')} />
            </ul>
        </div>
    )
}

const Logo = () => {
    return (
        <div className="header logo">
            <div>
                <h3 className="header logo simbolic text-accent">Local</h3>
            </div>
            <div className="text-7xl font-nixie font-extrabold 2xl:text-8xl">
                Charts
            </div>
        </div>
    );
}

const Slogan = () => {
    return (
        <div className="flex items-end justify-center font-mmd gap-4">
            <div>SEE</div><div>·</div><div>YOUR</div><div>·</div><div>DATA</div>
        </div>
    );
}


const Nav = () => {
    return (
        <div className="header container w-full md:w-4/5">
            <Logo />
            <Slogan />
            <Menus />
        </div>
)};



export default Nav;