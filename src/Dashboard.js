import React, {useContext} from 'react';
import { LoginContext } from './context/LoginContext';
import { Login } from './Login';

const Dashboard = () => {
    const {isLoggedIn} = useContext(LoginContext);
    return (
        <div>
            {isLoggedIn ? (
            <div>
                <h1>All your graphs are belong to us.</h1>
            </div>
            ) : (
            <div>
                <p>You must be logged in to contact us.</p>
                <Login />
            </div>
            )}
        </div>
    );
}

export default Dashboard;