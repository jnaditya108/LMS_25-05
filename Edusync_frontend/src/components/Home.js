// src/components/Home.js

import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    // Check if a token exists, meaning user is already logged in
    const isLoggedIn = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.clear();
        // A full page reload ensures all React state is reset and Navbar etc. re-renders
        window.location.href = '/';
    };

    return (
        <div style={homeContainerStyle}>
            <h1>Welcome to EduSync</h1>
            {isLoggedIn ? (
                <>
                    <p>You are logged in as a {role}.</p>
                    {role === 'Student' && <Link to="/student" style={homeLinkStyle}>Go to Student Dashboard</Link>}
                    {role === 'Educator' && <Link to="/educator" style={homeLinkStyle}>Go to Educator Dashboard</Link>}
                    <button style={logoutButtonStyle} onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <>
                    <p>Please log in or register to access the platform.</p>
                    {/* Added a container for better layout of multiple links */}
                    <div style={homeLinksContainerStyle}>
                        <Link to="/login" style={homeLinkStyle}>Go to Login</Link>
                        <Link to="/register" style={homeLinkStyle}>Register</Link> {/* <--- ADDED THIS LINK */}
                    </div>
                </>
            )}
        </div>
    );
}

// Styles - unchanged, but included for completeness
const homeContainerStyle = {
    textAlign: 'center',
    padding: '50px',
    fontFamily: 'Arial, sans-serif'
};

// NEW STYLE: To properly space out the login and register links
const homeLinksContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px', // Adds space between the links
    marginTop: '20px'
};

const homeLinkStyle = {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    // Removed marginRight as gap will handle spacing in the new container
    transition: 'background-color 0.3s ease'
};

const logoutButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
    marginLeft: '10px',
    transition: 'background-color 0.3s ease'
};

export default Home;