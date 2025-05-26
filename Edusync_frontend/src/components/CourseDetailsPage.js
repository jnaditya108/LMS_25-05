// src/components/CourseDetailsPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dataApi from '../services/dataApi';
import Navbar from './Navbar';
import './CourseDetailsPage.css';

function CourseDetailsPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await dataApi.get(`/courses/${courseId}`);
                setCourse(response.data);
            } catch (err) {
                console.error(`Error fetching course details for ID ${courseId}:`, err);
                setError('Failed to load course details. It might not exist or you lack permissions.');
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    localStorage.clear();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourseDetails();
        } else {
            setError("No Course ID provided.");
            setLoading(false);
        }
    }, [courseId, navigate]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="course-container">
                    <div className="loading">Loading course details...</div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="course-container">
                    <div className="error">{error}</div>
                    <button onClick={() => navigate('/student')} className="button button-secondary">
                        Back to Dashboard
                    </button>
                </div>
            </>
        );
    }

    if (!course) {
        return (
            <>
                <Navbar />
                <div className="course-container">
                    <div className="error">Course not found.</div>
                    <button onClick={() => navigate('/student')} className="button button-secondary">
                        Back to Dashboard
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="course-container">
                <div className="course-header">
                    <h2 className="course-title">{course.title}</h2>
                    <p className="course-instructor">Taught by: <strong>{course.instructorUsername}</strong></p>
                </div>

                <div className="course-content">
                    {course.videoUrl ? (
                        <div className="video-container">
                            <video 
                                controls 
                                className="course-video"
                                poster={course.thumbnailUrl ? `http://localhost:5121${course.thumbnailUrl}` : undefined}
                            >
                                <source src={`http://localhost:5121${course.videoUrl}`} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    ) : course.thumbnailUrl ? (
                        <div className="thumbnail-container">
                            <img 
                                src={`http://localhost:5121${course.thumbnailUrl}`}
                                alt={course.title}
                                className="course-thumbnail"
                            />
                        </div>
                    ) : null}

                    <div className="course-details">
                        <div className="course-description">
                            <h3>Course Description</h3>
                            <p>{course.description}</p>
                        </div>

                        <div className="course-progress">
                            <h3>Your Progress</h3>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '0%' }}></div>
                            </div>
                            <div className="progress-text">
                                <span>0% Complete</span>
                                <span>0/10 Lessons</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="course-actions">
                    <button onClick={() => navigate('/student')} className="button button-secondary">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </>
    );
}

export default CourseDetailsPage;