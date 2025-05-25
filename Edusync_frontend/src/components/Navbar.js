// src/components/Navbar.js

import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();

    // Function to handle user logout
    const handleLogout = () => {
        // Clear all items from localStorage (this will remove the token and role)
        localStorage.clear();
        // Navigate back to the login page (or home page)
        navigate('/');
    };

    // Get the user's role from localStorage to display in the welcome message
    const role = localStorage.getItem('role');
    // Get the username from localStorage (assuming you store it there after login)
    // If you are not storing username in localStorage, you might need to adjust this.
    // For now, let's just use the role or keep it generic.
    // If you also want to show username, your Login.jsx's API.post('/auth/login') should return username
    // and you should store it: localStorage.setItem('username', response.data.username);
    const username = localStorage.getItem('username'); // Assuming you stored it, if not, this will be null

    return (
        <nav style={navbarStyle}>
            <span style={welcomeMessageStyle}>
                Welcome, {username || (role ? `${role} User` : 'Guest')}! {/* Display username if available, else role, else Guest */}
            </span>
            <div style={navLinksStyle}>
                {/* Optional: Add role-specific links if needed later */}
                {role === 'Student' && (
                    <a href="/student" style={navLinkStyle}>Dashboard</a>
                )}
                {role === 'Educator' && (
                    <a href="/educator" style={navLinkStyle}>Dashboard</a>
                )}
                <button style={logoutButtonStyle} onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

// Basic Inline Styles for Navbar (you can move this to a CSS file)
const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#333',
    color: 'white',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
};

const welcomeMessageStyle = {
    fontSize: '1.1em',
    fontWeight: 'bold'
};

const navLinksStyle = {
    display: 'flex',
    gap: '15px' // Space between links/buttons
};

const navLinkStyle = {
    color: 'white',
    textDecoration: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    transition: 'background-color 0.3s ease',
    ':hover': {
        backgroundColor: '#555'
    }
};

const logoutButtonStyle = {
    padding: '8px 15px',
    backgroundColor: '#dc3545', // Bootstrap's danger color
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'background-color 0.3s ease',
    ':hover': {
        backgroundColor: '#c82333'
    }
};

export default Navbar;