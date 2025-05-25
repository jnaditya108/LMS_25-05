// src/components/AssessmentForm.jsx

import React, { useState, useEffect } from 'react';
import dataApi from '../services/dataApi';

function AssessmentForm({ assessmentToEdit, courseId, onAssessmentSaved, onCancel }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [associatedCourseId, setAssociatedCourseId] = useState(courseId || ''); // Pre-fill with passed courseId
    const [error, setError] = useState(null);

    useEffect(() => {
        if (assessmentToEdit) {
            setTitle(assessmentToEdit.title);
            setDescription(assessmentToEdit.description);
            setAssociatedCourseId(assessmentToEdit.courseId || ''); // Load existing courseId for editing
        } else {
            // For new assessment, ensure form is clean and courseId is set
            setTitle('');
            setDescription('');
            setAssociatedCourseId(courseId || '');
        }
    }, [assessmentToEdit, courseId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!associatedCourseId) {
            setError("Please select or confirm the associated course.");
            return;
        }

        const assessmentData = {
            id: assessmentToEdit ? assessmentToEdit.id : 0, // ID is 0 for new, existing for updates
            title,
            description,
            courseId: parseInt(associatedCourseId) // Ensure CourseId is a number
        };

        try {
            if (assessmentToEdit) {
                // Update existing assessment
                await dataApi.put(`/assessments/${assessmentData.id}`, assessmentData); // Assuming PUT /assessments/{id} exists for update
                alert('Assessment updated successfully!');
            } else {
                // Create new assessment
                await dataApi.post('/assessments', assessmentData);
                alert('Assessment created successfully!');
            }
            onAssessmentSaved(); // Callback to refresh assessment list
        } catch (err) {
            console.error('Failed to save assessment:', err.response ? err.response.data : err.message);
            const errorMessage = err.response?.data?.message || 'Failed to save assessment. Please check your input and backend.';
            setError(errorMessage);
        }
    };

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

    const selectStyle = {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '1em',
        marginTop: '5px'
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


    return (
        <div style={formContainerStyle}>
            <h3 style={formHeaderStyle}>{assessmentToEdit ? 'Edit Assessment' : 'Create New Assessment'}</h3>
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
                {/* For simplicity, we are setting CourseId directly via props for creation.
                    For editing, it displays the existing CourseId.
                    If you want to allow changing the course for an assessment, you would need
                    a dropdown populated with all courses. */}
                <label style={labelStyle}>
                    Associated Course ID:
                    <input
                        type="number"
                        value={associatedCourseId}
                        onChange={(e) => setAssociatedCourseId(e.target.value)}
                        required
                        readOnly={!!assessmentToEdit} // Make read-only when editing to prevent changing course
                        style={inputStyle}
                        title={assessmentToEdit ? "Cannot change course for an existing assessment through this form." : ""}
                    />
                </label>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <div style={buttonGroupStyle}>
                    <button type="submit" style={submitButtonStyle}>
                        {assessmentToEdit ? 'Update Assessment' : 'Add Assessment'}
                    </button>
                    <button type="button" onClick={onCancel} style={cancelButtonStyle}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AssessmentForm;