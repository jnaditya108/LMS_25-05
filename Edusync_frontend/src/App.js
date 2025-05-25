// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom'; // MODIFIED: Added useParams
import Login from './components/Login';
import EducatorDashboard from './components/EducatorDashboard';
import StudentDashboard from './components/StudentDashboard';
import Home from './components/Home';
import QuestionManager from './components/QuestionManager';
import Register from './components/Register';

// Enhanced PrivateRoute component (kept as is, it's well-structured)
function PrivateRoute({ children, allowedRoles }) {
    const isAuthenticated = () => {
        return localStorage.getItem('token') !== null;
    };

    const getUserRole = () => {
        return localStorage.getItem('role');
    };

    const auth = isAuthenticated();
    const userRole = getUserRole();

    if (!auth) {
        // Not authenticated, redirect to home (where login/register is accessible)
        return <Navigate to="/" />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Authenticated but role not allowed for this route, redirect to home
        return <Navigate to="/" />;
    }

    return children;
}

// NEW HELPER COMPONENT: A wrapper to extract assessmentId from URL and pass to QuestionManager
const QuestionManagerWrapper = () => {
    const { assessmentId } = useParams(); // Extract assessmentId from the URL
    // Ensure assessmentId is parsed as an integer, as IDs are typically numbers
    return <QuestionManager assessmentId={parseInt(assessmentId, 10)} />;
};

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Home page route */}
                    <Route path="/" element={<Home />} />
                    {/* Login page route */}
                    <Route path="/login" element={<Login />} />
                    {/* Register page route */}
                    <Route path="/register" element={<Register />} />

                    {/* Protected Student Dashboard */}
                    <Route
                        path="/student"
                        element={
                            <PrivateRoute allowedRoles={['Student']}>
                                <StudentDashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* Protected Educator Dashboard */}
                    <Route
                        path="/educator"
                        element={
                            <PrivateRoute allowedRoles={['Educator']}>
                                <EducatorDashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* NEW PROTECTED ROUTE: For Question Management */}
                    {/* This route will be like /educator/assessments/4/questions */}
                    <Route
                        path="/educator/assessments/:assessmentId/questions" // :assessmentId is a URL parameter
                        element={
                            <PrivateRoute allowedRoles={['Educator']}>
                                {/* Use the wrapper component to get the ID from the URL */}
                                <QuestionManagerWrapper />
                            </PrivateRoute>
                        }
                    />

                    {/* Optional: Fallback for any other unknown routes */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;