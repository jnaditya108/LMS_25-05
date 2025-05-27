import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { getCourses } from '../services/dataApi';
import './CourseContent.css';

function CourseContent() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('video');
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await getCourses();
                const foundCourse = response.data.find(c => c.id === parseInt(courseId));
                if (foundCourse) {
                    setCourse(foundCourse);
                } else {
                    setError('Course not found');
                }
            } catch (err) {
                console.error('Error fetching course:', err);
                setError('Failed to load course content');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    const handlePdfLoad = () => {
        setPdfLoading(false);
        setPdfError(null);
    };

    const handlePdfError = () => {
        setPdfLoading(false);
        setPdfError('Failed to load PDF content. Please try again later.');
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="course-content-container">
                    <div className="loading">Loading course content...</div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="course-content-container">
                    <div className="error">{error}</div>
                </div>
            </>
        );
    }

    if (!course) {
        return (
            <>
                <Navbar />
                <div className="course-content-container">
                    <div className="error">Course not found</div>
                </div>
            </>
        );
    }

    const handleTabChange = (tab) => {
        if (tab === 'pdf' && course.modulePdfUrl) {
            setPdfLoading(true);
            setPdfError(null);
        }
        setActiveTab(tab);
    };

    return (
        <>
            <Navbar />
            <div className="course-content-container">
                <div className="course-header">
                    <h1>{course.title}</h1>
                    <p className="instructor">Instructor: {course.instructorUsername}</p>
                </div>

                <div className="content-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'video' ? 'active' : ''}`}
                        onClick={() => handleTabChange('video')}
                    >
                        <i className="fas fa-video"></i> Video Content
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'pdf' ? 'active' : ''} ${!course.modulePdfUrl ? 'disabled' : ''}`}
                        onClick={() => handleTabChange('pdf')}
                        disabled={!course.modulePdfUrl}
                        title={!course.modulePdfUrl ? 'No PDF content available' : 'View PDF content'}
                    >
                        <i className="fas fa-file-pdf"></i> Course Module
                    </button>
                </div>

                <div className="content-area">
                    {activeTab === 'video' ? (
                        <div className="video-container">
                            {course.videoUrl ? (
                                <video 
                                    controls 
                                    className="course-video"
                                    poster={course.thumbnailUrl ? `http://localhost:5121${course.thumbnailUrl}` : undefined}
                                >
                                    <source src={`http://localhost:5121${course.videoUrl}`} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <div className="no-content">
                                    <i className="fas fa-video-slash"></i>
                                    <p>No video content available for this course.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="pdf-container">
                            {course.modulePdfUrl ? (
                                <>
                                    {pdfLoading && (
                                        <div className="pdf-loading">
                                            <i className="fas fa-spinner fa-spin"></i>
                                            <p>Loading PDF content...</p>
                                        </div>
                                    )}
                                    {pdfError && (
                                        <div className="pdf-error">
                                            <i className="fas fa-exclamation-circle"></i>
                                            <p>{pdfError}</p>
                                            <button onClick={() => handleTabChange('pdf')} className="retry-button">
                                                Retry
                                            </button>
                                        </div>
                                    )}
                                    <iframe
                                        src={`http://localhost:5121${course.modulePdfUrl}`}
                                        title="Course Module PDF"
                                        className="pdf-viewer"
                                        onLoad={handlePdfLoad}
                                        onError={handlePdfError}
                                    />
                                </>
                            ) : (
                                <div className="no-content">
                                    <i className="fas fa-file-pdf"></i>
                                    <p>No PDF module available for this course.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="course-details">
                    <h2>Course Description</h2>
                    <p>{course.description}</p>
                </div>
            </div>
        </>
    );
}

export default CourseContent; 