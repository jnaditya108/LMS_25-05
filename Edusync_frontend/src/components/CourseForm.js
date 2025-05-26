// src/components/CourseForm.js
import React, { useState, useEffect } from 'react';
import dataApi from '../services/dataApi';

function CourseForm({ courseToEdit, onCourseSaved, onCancel }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null); // NEW: For video file
    const [thumbnailFile, setThumbnailFile] = useState(null); // NEW: For thumbnail file
    const [existingVideoUrl, setExistingVideoUrl] = useState(''); // NEW: To show existing video/thumbnail
    const [existingThumbnailUrl, setExistingThumbnailUrl] = useState(''); // NEW: To show existing video/thumbnail
    const [error, setError] = useState(null);

    useEffect(() => {
        if (courseToEdit) {
            setTitle(courseToEdit.title);
            setDescription(courseToEdit.description);
            setExistingVideoUrl(courseToEdit.videoUrl || ''); // Load existing URL
            setExistingThumbnailUrl(courseToEdit.thumbnailUrl || ''); // Load existing URL
            // Reset file inputs when editing, as we don't pre-fill file inputs
            setVideoFile(null);
            setThumbnailFile(null);
        } else {
            setTitle('');
            setDescription('');
            setVideoFile(null);
            setThumbnailFile(null);
            setExistingVideoUrl('');
            setExistingThumbnailUrl('');
        }
    }, [courseToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);

        if (videoFile) {
            formData.append('videoFile', videoFile);
        }
        if (thumbnailFile) {
            formData.append('thumbnailFile', thumbnailFile);
        }

        try {
            if (courseToEdit) {
                await dataApi.put(`/courses/${courseToEdit.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' } // Important for FormData
                });
                alert('Course updated successfully!');
            } else {
                await dataApi.post('/courses', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' } // Important for FormData
                });
                alert('Course created successfully!');
            }
            onCourseSaved();
        } catch (err) {
            console.error('Failed to save course:', err.response ? err.response.data : err.message);
            const errorMessage = err.response?.data?.message || 'Failed to save course. Please check your input and backend.';
            setError(errorMessage);
        }
    };

    // Basic inline styles for the form (you can integrate the gradient styles from Dashboard)
    const formContainerStyle = {
        background: 'linear-gradient(to bottom right, #F0FFFF, #FFDAB9)', // Light teal to peach
        padding: '25px',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        marginTop: '20px',
        maxWidth: '600px',
        margin: 'auto'
    };

    const formHeaderStyle = {
        textAlign: 'center',
        color: '#4A4A4A',
        marginBottom: '25px',
        fontSize: '2em'
    };

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    };

    const labelStyle = {
        display: 'flex',
        flexDirection: 'column',
        fontSize: '0.95em',
        color: '#555',
        fontWeight: 'bold'
    };

    const inputStyle = {
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        fontSize: '1em',
        marginTop: '5px',
        backgroundColor: '#fff'
    };

    const fileInputStyle = {
        ...inputStyle,
        padding: '8px 10px' // Adjust padding for file input
    };

    const textareaStyle = {
        ...inputStyle,
        resize: 'vertical',
        minHeight: '80px'
    };

    const buttonGroupStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '20px'
    };

    const submitButtonStyle = {
        padding: '10px 20px',
        backgroundColor: '#4CAF50', // Green
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.3s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };
    submitButtonStyle[':hover'] = { backgroundColor: '#45a049' };

    const cancelButtonStyle = {
        padding: '10px 20px',
        backgroundColor: '#6c757d', // Grey
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.3s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };
    cancelButtonStyle[':hover'] = { backgroundColor: '#5a6268' };


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
                <label style={labelStyle}>
                    Upload Course Video:
                    <input
                        type="file"
                        accept="video/*" // Accept all video formats
                        onChange={(e) => setVideoFile(e.target.files[0])}
                        style={fileInputStyle}
                    />
                    {existingVideoUrl && (
                        <div>
                            Existing Video: <a href={`http://localhost:5121${existingVideoUrl}`} target="_blank" rel="noopener noreferrer">View Current Video</a>
                        </div>
                    )}
                </label>
                <label style={labelStyle}>
                    Upload Thumbnail Image:
                    <input
                        type="file"
                        accept="image/*" // Accept all image formats
                        onChange={(e) => setThumbnailFile(e.target.files[0])}
                        style={fileInputStyle}
                    />
                    {existingThumbnailUrl && (
                        <div>
                            Existing Thumbnail: <a href={`http://localhost:5121${existingThumbnailUrl}`} target="_blank" rel="noopener noreferrer">View Current Thumbnail</a>
                        </div>
                    )}
                </label>
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

export default CourseForm;