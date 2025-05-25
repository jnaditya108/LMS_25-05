// src/components/CourseForm.jsx

import React, { useState, useEffect } from 'react';
import dataApi from '../services/dataApi';

function CourseForm({ courseToEdit, onCourseSaved, onCancel }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [instructorId, setInstructorId] = useState(''); // Will be current logged-in educator's ID
    const [error, setError] = useState(null);

    // Get current logged-in user's ID to set as instructorId
    useEffect(() => {
        const currentUserId = localStorage.getItem('userId');
        if (currentUserId) {
            setInstructorId(parseInt(currentUserId)); // Ensure it's a number
        }

        // If a course is passed for editing, populate the form
        if (courseToEdit) {
            setTitle(courseToEdit.title);
            setDescription(courseToEdit.description);
            // Instructor ID should ideally be fetched from the courseToEdit if it changes,
            // but for now we assume the current logged-in educator is the instructor.
            // If the backend `Course` model has an `InstructorId` property, use that.
            // For now, we assume it's `courseToEdit.instructor.id` or similar if eager loaded.
            // Or if your Course model has an `InstructorId` foreign key.
            if (courseToEdit.instructor && courseToEdit.instructor.id) {
                setInstructorId(courseToEdit.instructor.id);
            }
        }
    }, [courseToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const courseData = {
            id: courseToEdit ? courseToEdit.id : 0, // ID is 0 for new courses, existing for updates
            title,
            description,
            instructorId // Assign the logged-in educator as the instructor
        };

        try {
            if (courseToEdit) {
                // Update existing course
                await dataApi.put(`/courses/${courseData.id}`, courseData);
                alert('Course updated successfully!');
            } else {
                // Create new course
                await dataApi.post('/courses', courseData);
                alert('Course created successfully!');
            }
            onCourseSaved(); // Callback to refresh course list in EducatorDashboard
        } catch (err) {
            console.error('Failed to save course:', err);
            const errorMessage = err.response?.data?.message || 'Failed to save course. Please check your input and try again.';
            setError(errorMessage);
        }
    };

    return (
        <div style={formContainerStyle}>
            <h3 style={formHeaderStyle}>{courseToEdit ? 'Edit Course' : 'Create New Course'}</h3>
            <form onSubmit={handleSubmit} style={formStyle}>
                <label style={labelStyle}>
                    Title:
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={inputStyle}
                    />
                </label>
                <label style={labelStyle}>
                    Description:
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows="4"
                        style={textareaStyle}
                    ></textarea>
                </label>
                {/* InstructorId is handled internally based on logged-in user, not exposed in form for simplicity */}
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <div style={buttonGroupStyle}>
                    <button type="submit" style={submitButtonStyle}>
                        {courseToEdit ? 'Update Course' : 'Add Course'}
                    </button>
                    <button type="button" onClick={onCancel} style={cancelButtonStyle}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

// Basic inline styles for the form
const formContainerStyle = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    marginTop: '20px',
    maxWidth: '500px',
    margin: 'auto'
};

const formHeaderStyle = {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px'
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
};

const labelStyle = {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '0.9em',
    color: '#555'
};

const inputStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1em',
    marginTop: '5px'
};

const textareaStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1em',
    marginTop: '5px',
    resize: 'vertical'
};

const buttonGroupStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px'
};

const submitButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'background-color 0.3s ease'
};

const cancelButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'background-color 0.3s ease'
};

export default CourseForm;