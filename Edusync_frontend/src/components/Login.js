// src/components/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/dataApi';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login({ username, password });
            console.log('Login response:', response);

            if (response && response.data && response.data.token) {
                // Store auth data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role);
                localStorage.setItem('username', response.data.username);
                localStorage.setItem('userId', response.data.userId);

                // Navigate based on role
                if (response.data.role === 'Student') {
                    navigate('/student');
                } else if (response.data.role === 'Educator') {
                    navigate('/educator');
                } else {
                    navigate('/');
                }
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Login Error:', err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials and ensure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={loginContainerStyle}>
            <h2 style={loginHeaderStyle}>Login to EduSync</h2>
            {error && <div style={errorStyle}>{error}</div>}
            <form onSubmit={handleLogin} style={loginFormStyle}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={inputStyle}
                    disabled={loading}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                    disabled={loading}
                />
                <button 
                    type="submit" 
                    style={buttonStyle}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}

// Styles
const loginContainerStyle = {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '30px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    backgroundColor: '#ffffff'
};

const loginHeaderStyle = {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px'
};

const loginFormStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
};

const inputStyle = {
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
    transition: 'border-color 0.3s ease',
    ':focus': {
        borderColor: '#007bff',
        outline: 'none'
    }
};

const buttonStyle = {
    padding: '12px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
    ':hover': {
        backgroundColor: '#0056b3'
    },
    ':disabled': {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed'
    }
};

const errorStyle = {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center'
};

export default Login;