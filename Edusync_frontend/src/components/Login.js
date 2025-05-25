// src/components/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // First API call: Login (gets the token)
            const authResponse = await API.post('/auth/login', {
                username: username,
                password: password
            });
            const { token } = authResponse.data; // Only token is expected from this endpoint
            localStorage.setItem('token', token);

            // Second API call: Get user profile details (gets role and username)
            const userProfileResponse = await API.get('/userprofile/me');
            // Assuming userProfileResponse.data contains { userId, username, role }
            const { role, username: fetchedUsername, userId } = userProfileResponse.data;

            // Store the role, username, and userId from the /userprofile/me response
            localStorage.setItem('role', role);
            localStorage.setItem('username', fetchedUsername); // Store the username for Navbar
            localStorage.setItem('userId', userId); // Store userId if you need it

            // Now, use the fetched role for navigation
            if (role === 'Student') {
                navigate('/student');
            } else if (role === 'Educator') {
                navigate('/educator');
            } else {
                // This 'else' block will now only be hit if 'role' is genuinely not 'Student' or 'Educator'
                alert('Login successful, but role not recognized. Redirecting to home.');
                navigate('/');
            }

        } catch (err) {
            alert('Login failed! Please check your username and password.');
            console.error("Login Error:", err); // Log the full error to the console for debugging
        }
    };

    return (
        <div style={loginContainerStyle}>
            <h2 style={loginHeaderStyle}>Login</h2>
            <form onSubmit={handleLogin} style={loginFormStyle}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={inputStyle}
                /><br />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                /><br />
                <button type="submit" style={buttonStyle}>Login</button>
            </form>
        </div>
    );
}

// Basic inline styles for Login page
const loginContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f4f4',
    fontFamily: 'Arial, sans-serif'
};

const loginHeaderStyle = {
    color: '#333',
    marginBottom: '20px'
};

const loginFormStyle = {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
};

const inputStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1em',
    width: '250px' // Fixed width for inputs
};

const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'background-color 0.3s ease'
};

export default Login;