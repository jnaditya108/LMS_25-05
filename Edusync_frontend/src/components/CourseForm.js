// src/components/CourseForm.js
import React, { useState, useEffect } from 'react';
import { createCourse, updateCourse } from '../services/dataApi';

function CourseForm({ courseToEdit, onCourseSaved, onCancel }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [modulePdfFile, setModulePdfFile] = useState(null);
    const [existingVideoUrl, setExistingVideoUrl] = useState('');
    const [existingThumbnailUrl, setExistingThumbnailUrl] = useState('');
    const [existingModulePdfUrl, setExistingModulePdfUrl] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (courseToEdit) {
            setTitle(courseToEdit.title || '');
            setDescription(courseToEdit.description || '');
            setExistingVideoUrl(courseToEdit.videoUrl || '');
            setExistingThumbnailUrl(courseToEdit.thumbnailUrl || '');
            setExistingModulePdfUrl(courseToEdit.modulePdfUrl || '');
            setVideoFile(null);
            setThumbnailFile(null);
            setModulePdfFile(null);
        } else {
            resetForm();
        }
    }, [courseToEdit]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setVideoFile(null);
        setThumbnailFile(null);
        setModulePdfFile(null);
        setExistingVideoUrl('');
        setExistingThumbnailUrl('');
        setExistingModulePdfUrl('');
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            console.log('Form submitted. Course to edit:', courseToEdit);
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('description', description.trim());

            if (videoFile) {
                console.log('Appending video file:', videoFile.name);
                formData.append('videoFile', videoFile);
            }
            if (thumbnailFile) {
                console.log('Appending thumbnail file:', thumbnailFile.name);
                formData.append('thumbnailFile', thumbnailFile);
            }
            if (modulePdfFile) {
                console.log('Appending PDF file:', modulePdfFile.name);
                formData.append('modulePdfFile', modulePdfFile);
            }

            console.log('FormData contents:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
            }

            let response;
            if (courseToEdit) {
                console.log('Updating course with ID:', courseToEdit.id);
                response = await updateCourse(courseToEdit.id, formData);
                console.log('Update response:', response);
            } else {
                console.log('Creating new course');
                response = await createCourse(formData);
                console.log('Create response:', response);
            }

            if (response && (response.status === 200 || response.status === 201 || response.status === 204)) {
                console.log('Course saved successfully');
                onCourseSaved();
            } else {
                console.error('Unexpected response:', response);
                throw new Error('Failed to save course');
            }
        } catch (err) {
            console.error('Failed to save course:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to save course. Please try again.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formContainerStyle = {
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        maxWidth: '800px',
        margin: '20px auto',
        position: 'relative',
        overflow: 'hidden'
    };

    const formHeaderStyle = {
        color: '#2c3e50',
        fontSize: '1.8em',
        marginBottom: '25px',
        textAlign: 'center',
        fontWeight: '600',
        borderBottom: '2px solid #e1e8ed',
        paddingBottom: '15px'
    };

    const formStyle = {
        display: 'grid',
        gap: '20px'
    };

    const labelStyle = {
        color: '#34495e',
        fontSize: '1rem',
        fontWeight: '500',
        marginBottom: '5px'
    };

    const inputContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    };

    const inputStyle = {
        padding: '12px 15px',
        borderRadius: '8px',
        border: '2px solid #e1e8ed',
        fontSize: '1rem',
        transition: 'border-color 0.3s ease',
        backgroundColor: '#fff',
        '&:focus': {
            borderColor: '#3498db',
            outline: 'none'
        }
    };

    const textareaStyle = {
        ...inputStyle,
        minHeight: '120px',
        resize: 'vertical'
    };

    const fileInputContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '15px',
        border: '2px dashed #cbd5e0',
        borderRadius: '8px',
        backgroundColor: '#f8fafc',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    };

    const filePreviewStyle = {
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#fff',
        borderRadius: '6px',
        border: '1px solid #e1e8ed'
    };

    const buttonGroupStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '15px',
        marginTop: '25px'
    };

    const buttonBaseStyle = {
        padding: '12px 25px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const submitButtonStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#2ecc71',
        color: 'white',
        '&:hover': {
            backgroundColor: '#27ae60'
        },
        opacity: isSubmitting ? 0.7 : 1,
        cursor: isSubmitting ? 'not-allowed' : 'pointer'
    };

    const cancelButtonStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#e74c3c',
        color: 'white',
        '&:hover': {
            backgroundColor: '#c0392b'
        }
    };

    return (
        <div style={formContainerStyle}>
            <h3 style={formHeaderStyle}>
                {courseToEdit ? 'Update Course' : 'Create New Course'}
            </h3>
            <form onSubmit={handleSubmit} style={formStyle}>
                <div style={inputContainerStyle}>
                    <label style={labelStyle}>Course Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={inputStyle}
                        placeholder="Enter course title"
                    />
                </div>

                <div style={inputContainerStyle}>
                    <label style={labelStyle}>Course Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        style={textareaStyle}
                        placeholder="Enter course description"
                    />
                </div>

                <div style={inputContainerStyle}>
                    <label style={labelStyle}>Course Video</label>
                    <div style={fileInputContainerStyle}>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => setVideoFile(e.target.files[0])}
                            style={{ display: 'none' }}
                            id="video-upload"
                        />
                        <label htmlFor="video-upload" style={{ cursor: 'pointer' }}>
                            {videoFile ? videoFile.name : 'Click to upload video'}
                        </label>
                        {existingVideoUrl && (
                            <div style={filePreviewStyle}>
                                Current Video: <a href={`http://localhost:5121${existingVideoUrl}`} target="_blank" rel="noopener noreferrer">View</a>
                            </div>
                        )}
                    </div>
                </div>

                <div style={inputContainerStyle}>
                    <label style={labelStyle}>Course Thumbnail</label>
                    <div style={fileInputContainerStyle}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setThumbnailFile(e.target.files[0])}
                            style={{ display: 'none' }}
                            id="thumbnail-upload"
                        />
                        <label htmlFor="thumbnail-upload" style={{ cursor: 'pointer' }}>
                            {thumbnailFile ? thumbnailFile.name : 'Click to upload thumbnail'}
                        </label>
                        {existingThumbnailUrl && (
                            <div style={filePreviewStyle}>
                                <img 
                                    src={`http://localhost:5121${existingThumbnailUrl}`} 
                                    alt="Current thumbnail" 
                                    style={{ maxWidth: '200px', borderRadius: '4px' }} 
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div style={inputContainerStyle}>
                    <label style={labelStyle}>Course Module (PDF)</label>
                    <div style={fileInputContainerStyle}>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setModulePdfFile(e.target.files[0])}
                            style={{ display: 'none' }}
                            id="pdf-upload"
                        />
                        <label htmlFor="pdf-upload" style={{ cursor: 'pointer' }}>
                            {modulePdfFile ? modulePdfFile.name : 'Click to upload PDF'}
                        </label>
                        {existingModulePdfUrl && (
                            <div style={filePreviewStyle}>
                                Current PDF: <a href={`http://localhost:5121${existingModulePdfUrl}`} target="_blank" rel="noopener noreferrer">View</a>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div style={{ 
                        color: '#e74c3c', 
                        padding: '10px', 
                        borderRadius: '6px', 
                        backgroundColor: '#fde8e8',
                        marginTop: '10px'
                    }}>
                        {error}
                    </div>
                )}

                <div style={buttonGroupStyle}>
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        style={cancelButtonStyle}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        style={submitButtonStyle}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : courseToEdit ? 'Update Course' : 'Create Course'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CourseForm;