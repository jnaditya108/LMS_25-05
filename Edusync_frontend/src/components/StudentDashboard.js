// src/components/StudentDashboard.js

import React, { useState } from 'react'; // Import useState
import Navbar from './Navbar';
import { getAssessments, getCourses } from '../services/dataApi'; // Import the new data fetching functions

function StudentDashboard() {
    // State to hold fetched data
    const [assessments, setAssessments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [message, setMessage] = useState(''); // To display success/error messages

    // Function to fetch assessments
    const fetchAssessments = async () => {
        setMessage('Fetching assessments...');
        try {
            const response = await getAssessments(); // Call the dataApi function
            setAssessments(response.data);
            setMessage('Assessments fetched successfully!');
        } catch (error) {
            console.error('Failed to fetch assessments:', error);
            setMessage('Failed to fetch assessments. Check console for details.');
            setAssessments([]); // Clear assessments on error
        }
    };

    // Function to fetch courses
    const fetchCourses = async () => {
        setMessage('Fetching courses...');
        try {
            const response = await getCourses(); // Call the dataApi function
            setCourses(response.data);
            setMessage('Courses fetched successfully!');
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            setMessage('Failed to fetch courses. Check console for details.');
            setCourses([]); // Clear courses on error
        }
    };

    return (
        <>
            <Navbar />
            <div style={dashboardContentStyle}>
                <h2>Student Dashboard</h2>
                <p>Welcome to your student portal. Here you can find your courses, assessments, and grades.</p>

                {message && <p style={messageStyle}>{message}</p>} {/* Display messages */}

                {/* Section for Assessments */}
                <div style={featureSectionStyle}>
                    <h3>My Assessments</h3>
                    <p>List of upcoming and past assessments will appear here.</p>
                    <button style={placeholderButtonStyle} onClick={fetchAssessments}>
                        View All Assessments
                    </button>
                    {/* Display fetched assessments */}
                    {assessments.length > 0 ? (
                        <ul style={listStyle}>
                            {assessments.map((assessment) => (
                                <li key={assessment.id} style={listItemStyle}>
                                    Assessment: **{assessment.name}** (ID: {assessment.id}) - Due: {assessment.dueDate || 'N/A'}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        assessments.length === 0 && message.includes('Assessments fetched successfully!') &&
                        <p>No assessments found.</p>
                    )}
                </div>

                {/* Section for Courses */}
                <div style={featureSectionStyle}>
                    <h3>Course Progress</h3>
                    <p>Track your progress in various courses.</p>
                    <button style={placeholderButtonStyle} onClick={fetchCourses}>
                        Go to Courses
                    </button>
                    {/* Display fetched courses */}
                    {courses.length > 0 ? (
                        <ul style={listStyle}>
                            {courses.map((course) => (
                                <li key={course.id} style={listItemStyle}>
                                    Course: **{course.name}** (Code: {course.code || 'N/A'})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        courses.length === 0 && message.includes('Courses fetched successfully!') &&
                        <p>No courses found.</p>
                    )}
                </div>
            </div>
        </>
    );
}

// Basic inline styles (keep these, or move to a CSS file)
const dashboardContentStyle = {
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
};

const featureSectionStyle = {
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const placeholderButtonStyle = {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
    marginRight: '10px', // Added margin for spacing
    transition: 'background-color 0.3s ease'
};

const messageStyle = {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#e0ffe0',
    borderLeft: '5px solid #00c853',
    color: '#333'
};

const listStyle = {
    listStyleType: 'none',
    padding: '0',
    marginTop: '15px'
};

const listItemStyle = {
    backgroundColor: '#f0f8ff',
    border: '1px solid #e0e0e0',
    padding: '10px',
    marginBottom: '5px',
    borderRadius: '5px'
};

export default StudentDashboard;