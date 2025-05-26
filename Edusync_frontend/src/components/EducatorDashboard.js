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
                console.log(`Attempting to delete course with ID: ${courseId}`);
                const response = await dataApi.delete(`/courses/${courseId}`);
                console.log('Delete course response:', response);
                
                if (response.status === 200) {
                    setMessage('Course deleted successfully!');
                    await fetchCourses();
                } else {
                    throw new Error(response.data?.message || 'Failed to delete course');
                }
            } catch (err) {
                console.error('Failed to delete course:', err);
                console.error('Error details:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                
                if (err.response?.status === 401) {
                    localStorage.clear();
                    navigate('/login');
                    return;
                }
                
                if (err.response?.status === 403) {
                    setError('You are not authorized to delete this course.');
                    return;
                }
                
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
        navigate(`/educator/assessments/${assessmentId}/questions`);
    };

    // Placeholder handler for "View Students" button (implement as needed)
    const handleViewStudentsClick = (courseId) => {
        navigate(`/educator/courses/${courseId}/students`);
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
                                        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', width: '100%' }}>
                                            {course.thumbnailUrl && (
                                                <img
                                                    src={`http://localhost:5121${course.thumbnailUrl}`}
                                                    alt={`${course.title} Thumbnail`}
                                                    style={{ width: '80px', height: 'auto', borderRadius: '5px', marginRight: '15px', objectFit: 'cover' }}
                                                />
                                            )}
                                            <div>
                                                <strong>{course.title}</strong> - {course.description}
                                            </div>
                                        </div>
                                        <div style={actionButtonsContainerStyle}>
                                            <button style={editButtonStyle} onClick={() => handleEditCourseClick(course)}>Edit Course</button>
                                            <button style={deleteButtonStyle} onClick={() => handleDeleteCourse(course.id)}>Delete Course</button>
                                            <button style={viewStudentsButtonStyle} onClick={() => handleViewStudentsClick(course.id)}>View Students</button>
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
                                                                    <button
                                                                        style={smallButtonStyle}
                                                                        onClick={() => handleManageQuestionsClick(assessment.id)}
                                                                    >
                                                                        Manage Questions
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                </ul>
                                            )}
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

// Styles

const dashboardContainerStyle = {
    maxWidth: '1200px',
    margin: '30px auto',
    padding: '0 15px',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    color: '#333',
};

const dashboardHeaderStyle = {
    fontSize: '2.2rem',
    marginBottom: '20px',
};

const featureSectionStyle = {
    marginTop: '40px',
    paddingBottom: '40px',
    borderBottom: '2px solid #f0f0f0',
};

const sectionHeaderStyle = {
    fontSize: '1.7rem',
    color: '#007bff',
    marginBottom: '15px',
};

const subSectionHeaderStyle = {
    fontSize: '1.3rem',
    marginBottom: '12px',
    color: '#555',
};

const listStyle = {
    listStyleType: 'none',
    paddingLeft: 0,
};

const listItemStyle = {
    background: 'linear-gradient(to right, #FFF5E0, #F0F8FF)', // Soft gradient
    border: '1px solid #FFDAB9', // Peach border
    borderRadius: '8px',
    padding: '15px 20px',
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
};

const subListItemStyle = {
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '10px 15px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
};

const actionButtonsContainerStyle = {
    marginTop: '10px',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
};

const actionButtonStyle = {
    backgroundColor: '#007bff',
    border: 'none',
    color: '#fff',
    padding: '8px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'background-color 0.3s ease',
};

const editButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: '#28a745',
};

const deleteButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: '#dc3545',
};

const viewStudentsButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: '#17a2b8',
};

const smallButtonStyle = {
    backgroundColor: '#6c757d',
    border: 'none',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'background-color 0.3s ease',
};

const messageStyle = {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: '5px',
    padding: '10px 15px',
    marginTop: '15px',
    marginBottom: '15px',
};

export default EducatorDashboard;