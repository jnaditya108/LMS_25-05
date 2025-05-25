// src/components/Register.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api'; // Assuming your general API instance is in api.js

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('Student'); // Default role, matches backend's default or expected input
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            // Making the API call to your existing /api/users/register endpoint
            const response = await API.post('/users/register', {
                username,
                email,
                password, // Sending plain text password as per your current backend (UsersController.cs)
                role // Sending the selected role
            });

            // Assuming your backend returns a message like { message: "Registration successful!" }
            alert(response.data.message || 'Registration successful! Please log in.');
            navigate('/login'); // Redirect to login page after successful registration

        } catch (err) {
            console.error('Registration failed:', err);
            // Attempt to get a more specific error message from the backend response
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
            alert(errorMessage);
        }
    };

    return (
        <div style={registerContainerStyle}>
            <h2 style={registerHeaderStyle}>Register New Account</h2>
            <form onSubmit={handleRegister} style={registerFormStyle}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={inputStyle}
                /><br />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                /><br />
                <input
                    type="password"
                    placeholder="Password" // No minLength, as per your current backend
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                /><br />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={inputStyle}
                /><br />

                <label style={labelStyle}>
                    Register as:
                    <select value={role} onChange={(e) => setRole(e.target.value)} style={selectStyle}>
                        <option value="Student">Student</option>
                        <option value="Educator">Educator</option>
                    </select>
                </label>
                <br />

                <button type="submit" style={buttonStyle}>Register</button>
            </form>
            <p style={linkTextStyle}>
                Already have an account? <Link to="/login" style={linkStyle}>Login here</Link>
            </p>
        </div>
    );
}

// Basic inline styles for Register page
const registerContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f4f4',
    fontFamily: 'Arial, sans-serif'
};

const registerHeaderStyle = {
    color: '#333',
    marginBottom: '20px'
};

const registerFormStyle = {
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
    width: '250px'
};

const labelStyle = {
    fontSize: '0.9em',
    color: '#555'
};

const selectStyle = {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1em',
    marginLeft: '10px'
};

const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#28a745', // Green for register
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'background-color 0.3s ease'
};

const linkTextStyle = {
    marginTop: '15px',
    fontSize: '0.9em'
};

const linkStyle = {
    color: '#007bff',
    textDecoration: 'none'
};

export default Register;