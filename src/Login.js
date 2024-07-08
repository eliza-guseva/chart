import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from './context/LoginContext';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL
});

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    // useContext hook to access the LoginContext
    const { isLoggedIn, setIsLoggedIn, toggleLogin } = useContext(LoginContext);
    const navigate = useNavigate();
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await api.post('/login', { email, password });
            console.log('Login successful:', response.data);
            toggleLogin();
            navigate(-1); // Go back to the previous page
        } catch (err) {
            setIsLoggedIn(false);
            setError('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <div>
            {isLoggedIn ? ( // Conditional rendering based on login status
                <h2>You are logged in</h2>
            ) : (
        <div>
            <h2 className='loginheader'>Login</h2>
            <form onSubmit={handleSubmit} className='loginform'>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor='password'>Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
            )}
        </div>
    );
};



export { Login };
