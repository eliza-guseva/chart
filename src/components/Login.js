import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../context/LoginContext';
import { 
    emailInput, 
    passwordInput, 
    repeatPasswordInput, 
    codeInput 
} from './FormComponents';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL
});



const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistered, setIsRegistered] = useState(true);
    const [invitationCode, setInvitationCode] = useState('');
    // useContext hook to access the LoginContext
    const { isLoggedIn, setIsLoggedIn, toggleLogin } = useContext(LoginContext);
    const navigate = useNavigate();
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await api.post('/login', { email, password });
            console.log('Login successful:', response.data);
            toggleLogin();
        } catch (err) {
            setIsLoggedIn(false);
            setError('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        // first check for login status, then for registration status
        <div>
            {isLoggedIn ? (
                <div>
                    <h1>You are already logged in.</h1>
                    <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
                </div>
            ) : (
                // check if registered, show different form if not
                <div>
                    {isRegistered ? (
                        <div>
                        <form onSubmit={handleSubmit}>
                            <h2>Login</h2>
                            {emailInput(email, setEmail)}
                            {passwordInput(password, setPassword)}
                            <button className='btn btnstd' type="submit">Login</button>
                            <p>{error}</p>
                        </form>
                        <button className='btn btnboring !mt-4'
                        onClick={() => setIsRegistered(false)}>Not registered?</button>
                        </div>
                    ) : (
                        <div>
                        <form onSubmit={handleSubmit}>
                            <h2>Register</h2>
                            {emailInput(email, setEmail)}
                            {passwordInput(password, setPassword)}
                            {repeatPasswordInput(repeatPassword, setRepeatPassword)}
                            {codeInput(invitationCode, setInvitationCode)}
                            <button className='btn btnstd' type="submit">Register</button>  
                        </form>
                        <button className='btn btnboring' onClick={() => setIsRegistered(true)}>Already registered?</button>
                            <p>{error}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};



export { Login };
