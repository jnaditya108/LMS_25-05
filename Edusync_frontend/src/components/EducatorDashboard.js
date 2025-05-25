// src/components/EducatorDashboard.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dataApi from '../services/dataApi';
import Navbar from './Navbar';
import CourseForm from './CourseForm';
import AssessmentForm from './AssessmentForm';

function EducatorDashboard() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [allAssessments, setAllAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const [showCourseForm, setShowCourseForm] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState(null);

    const [showAssessmentForm, setShowAssessmentForm] = useState(false);
    const [assessmentToEdit, setAssessmentToEdit] = useState(null);
    const [currentCourseIdForAssessment, setCurrentCourseIdForAssessment] = useState(null);

    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');

    // --- Data Fetching Functions ---
    const fetchCourses = async () => {
        try {
            const coursesResponse = await dataApi.get('/courses');
            const educatorsCourses = coursesResponse.data.filter(course =>
                course.instructorId === parseInt(userId) || (course.instructor && course.instructor.id === parseInt(userId))
            );
            setCourses(educatorsCourses);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to load courses.');
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.clear();
                navigate('/login');
            }
        }
    };

    const fetchAllAssessments = async () => {
        try {
            const assessmentsResponse = await dataApi.get('/assessments');
            setAllAssessments(assessmentsResponse.data);
        } catch (err) {
            console.error('Error fetching assessments:', err);
            setError('Failed to load assessments.');
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.clear();
                navigate('/login');
            }
        }
    };

    // --- useEffect for Initial Data Load ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setMessage('');
            await fetchCourses();
            await fetchAllAssessments();
            setLoading(false);
        };
        fetchData();
    }, [userId, navigate]);

    // --- Handlers for Course Operations ---
    const handleCreateCourseClick = () => {
        setCourseToEdit(null);
        setShowCourseForm(true);
        setShowAssessmentForm(false);
        setMessage('');
    };

    const handleEditCourseClick = (course) => {
        setCourseToEdit(course);
        setShowCourseForm(true);
        setShowAssessmentForm(false);
        setMessage('');
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            try {
                await dataApi.delete(`/courses/${courseId}`);
                setMessage('Course deleted successfully!');
                await fetchCourses();
            } catch (err) {
                console.error('Failed to delete course:', err);
                const errorMessage = err.response?.data?.message || 'Failed to delete course.';
                setError(errorMessage);
                setMessage('');
            }
        }
    };

    const handleCourseSaved = async () => {
        setShowCourseForm(false);
        setCourseToEdit(null);
        await fetchCourses();
        setMessage('Course saved successfully!');
    };

    const handleCancelCourseForm = () => {
        setShowCourseForm(false);
        setCourseToEdit(null);
        setMessage('');
    };

    // --- Handlers for Assessment Operations ---
    const handleCreateAssessmentClick = (courseId) => {
        setAssessmentToEdit(null);
        setCurrentCourseIdForAssessment(courseId);
        setShowAssessmentForm(true);
        setShowCourseForm(false);
        setMessage('');
    };

    const handleEditAssessmentClick = (assessment) => {
        setAssessmentToEdit(assessment);
        setCurrentCourseIdForAssessment(assessment.courseId);
        setShowAssessmentForm(true);
        setShowCourseForm(false);
        setMessage('');
    };

    const handleDeleteAssessment = async (assessmentId) => {
        if (window.confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
            try {
                await dataApi.delete(`/assessments/${assessmentId}`);
                setMessage('Assessment deleted successfully!');
                await fetchAllAssessments();
            } catch (err) {
                console.error('Failed to delete assessment:', err);
                const errorMessage = err.response?.data?.message || 'Failed to delete assessment.';
                setError(errorMessage);
                setMessage('');
            }
        }
    };

    const handleAssessmentSaved = async () => {
        setShowAssessmentForm(false);
        setAssessmentToEdit(null);
        setCurrentCourseIdForAssessment(null);
        await fetchAllAssessments();
        setMessage('Assessment saved successfully!');
    };

    const handleCancelAssessmentForm = () => {
        setShowAssessmentForm(false);
        setAssessmentToEdit(null);
        setCurrentCourseIdForAssessment(null);
        setMessage('');
    };

    // --- NEW: Handler for "Manage Questions" button ---
    const handleManageQuestionsClick = (assessmentId) => {
        // Assuming your route for managing questions is /educator/assessments/:assessmentId/questions
        navigate(`/educator/assessments/${assessmentId}/questions`);
    };

    // --- Loading and Error Display ---
    if (loading) {
        return <div style={dashboardContainerStyle}>Loading educator dashboard...</div>;
    }

    if (error) {
        return <div style={dashboardContainerStyle}><p style={{ color: 'red' }}>{error}</p></div>;
    }

    return (
        <>
            <Navbar />
            <div style={dashboardContainerStyle}>
                <h2 style={dashboardHeaderStyle}>Educator Dashboard</h2>
                <p>Welcome, {username} (Educator ID: {userId})!</p>

                {message && <p style={messageStyle}>{message}</p>}

                {/* Conditional rendering for Course Form */}
                {showCourseForm && (
                    <CourseForm
                        courseToEdit={courseToEdit}
                        onCourseSaved={handleCourseSaved}
                        onCancel={handleCancelCourseForm}
                    />
                )}

                {/* Conditional rendering for Assessment Form */}
                {showAssessmentForm && (
                    <AssessmentForm
                        assessmentToEdit={assessmentToEdit}
                        courseId={currentCourseIdForAssessment}
                        onAssessmentSaved={handleAssessmentSaved}
                        onCancel={handleCancelAssessmentForm}
                    />
                )}

                {/* Section for Course Management */}
                {!showCourseForm && !showAssessmentForm && (
                    <div style={featureSectionStyle}>
                        <h3 style={sectionHeaderStyle}>Your Courses</h3>
                        <button style={actionButtonStyle} onClick={handleCreateCourseClick}>Create New Course</button>
                        {courses.length === 0 ? (
                            <p>No courses created yet.</p>
                        ) : (
                            <ul style={listStyle}>
                                {courses.map((course) => (
                                    <li key={course.id} style={listItemStyle}>
                                        <div style={{ flexGrow: 1 }}>
                                            <strong>{course.title}</strong> - {course.description}
                                            <div style={actionButtonsContainerStyle}>
                                                <button style={smallButtonStyle} onClick={() => handleEditCourseClick(course)}>Edit Course</button>
                                                <button style={{ ...smallButtonStyle, backgroundColor: '#dc3545' }} onClick={() => handleDeleteCourse(course.id)}>Delete Course</button>
                                            </div>

                                            {/* Nested section for Assessments under this Course */}
                                            <div style={{ marginLeft: '20px', marginTop: '15px', borderTop: '1px dashed #eee', paddingTop: '10px' }}>
                                                <h4 style={subSectionHeaderStyle}>Assessments for "{course.title}"</h4>
                                                <button style={actionButtonStyle} onClick={() => handleCreateAssessmentClick(course.id)}>Create New Assessment for this Course</button>
                                                {allAssessments.filter(a => a.courseId === course.id).length === 0 ? (
                                                    <p>No assessments for this course yet.</p>
                                                ) : (
                                                    <ul style={listStyle}>
                                                        {allAssessments
                                                            .filter(a => a.courseId === course.id)
                                                            .map((assessment) => (
                                                                <li key={assessment.id} style={subListItemStyle}>
                                                                    <span><strong>{assessment.title}</strong> - {assessment.description}</span>
                                                                    <div style={actionButtonsContainerStyle}>
                                                                        <button style={smallButtonStyle} onClick={() => handleEditAssessmentClick(assessment)}>Edit Assessment</button>
                                                                        <button style={{ ...smallButtonStyle, backgroundColor: '#dc3545' }} onClick={() => handleDeleteAssessment(assessment.id)}>Delete Assessment</button>
                                                                        {/* The fix is here! */}
                                                                        <button
                                                                            style={smallButtonStyle}
                                                                            onClick={() => handleManageQuestionsClick(assessment.id)} // <--- ADD THIS onClick HANDLER
                                                                        >
                                                                            Manage Questions
                                                                        </button>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}


                {/* Section for Question Bank (placeholder for now) */}
                {!showCourseForm && !showAssessmentForm && (
                    <div style={featureSectionStyle}>
                        <h3 style={sectionHeaderStyle}>Question Bank</h3>
                        <p>Manage individual questions outside of a specific assessment (or link to assessment question management here).</p>
                        <button style={actionButtonStyle}>Go to Question Bank</button>
                        <p>Functionality for global question bank management coming soon.</p>
                    </div>
                )}
            </div>
        </>
    );
}

// Re-using and refining styles (ensure consistency across components)
const dashboardContainerStyle = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '900px',
    margin: '20px auto',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const dashboardHeaderStyle = {
    color: '#333',
    textAlign: 'center',
    marginBottom: '30px'
};

const featureSectionStyle = {
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const sectionHeaderStyle = {
    color: '#555',
    marginBottom: '15px'
};

const subSectionHeaderStyle = {
    color: '#666',
    marginBottom: '10px',
    fontSize: '1.1em'
};

const listStyle = {
    listStyleType: 'none',
    padding: 0
};

const listItemStyle = {
    backgroundColor: '#e9f7ff',
    border: '1px solid #cceeff',
    borderRadius: '5px',
    padding: '10px 15px',
    marginBottom: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '10px'
};

const subListItemStyle = {
    backgroundColor: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '8px 12px',
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
};

const actionButtonStyle = {
    padding: '8px 15px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9em',
    marginBottom: '15px',
    transition: 'background-color 0.3s ease',
    width: 'fit-content',
    display: 'inline-block',
    marginRight: '10px'
};

const actionButtonsContainerStyle = {
    display: 'flex',
    gap: '10px',
    marginTop: '5px'
};

const smallButtonStyle = {
    padding: '5px 10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8em',
    transition: 'background-color 0.3s ease'
};

const messageStyle = {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#e0ffe0',
    borderLeft: '5px solid #00c853',
    color: '#333',
    borderRadius: '5px'
};


export default EducatorDashboard;