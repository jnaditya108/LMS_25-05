// src/components/CourseStudentsPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dataApi from '../services/dataApi';
import Navbar from './Navbar';

function CourseStudentsPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [courseTitle, setCourseTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            setError(null);
            try {
                // First, fetch course details to get the title
                const courseResponse = await dataApi.get(`/courses/${courseId}`);
                setCourseTitle(courseResponse.data.title);

                // Then, fetch the students for that course
                const studentsResponse = await dataApi.get(`/courses/${courseId}/students`);
                console.log('Students response:', studentsResponse.data); // Debug log
                setStudents(studentsResponse.data.students || []); // Changed from Students to students
            } catch (err) {
                console.error(`Error fetching students for course ${courseId}:`, err);
                const errorMessage = err.response?.data?.message || 'Failed to load students. Please check if the course exists or if you have permission.';
                setError(errorMessage);
                if (err.response?.status === 401) {
                    localStorage.clear();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchStudents();
        } else {
            setError("No Course ID provided in the URL.");
            setLoading(false);
        }
    }, [courseId, navigate]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div style={containerStyle}>
                    <div style={loadingStyle}>
                        <div style={spinnerStyle}></div>
                        Loading students...
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div style={containerStyle}>
                    <div style={errorStyle}>{error}</div>
                    <button onClick={() => navigate('/educator')} style={backButtonStyle}>Back to Dashboard</button>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div style={containerStyle}>
                <div style={headerContainerStyle}>
                    <h2 style={headerStyle}>Students Enrolled in "{courseTitle}"</h2>
                    <button onClick={() => navigate('/educator')} style={backButtonStyle}>Back to Dashboard</button>
                </div>

                {students.length === 0 ? (
                    <div style={emptyStateStyle}>
                        <i className="fas fa-users-slash" style={emptyStateIconStyle}></i>
                        <p>No students enrolled in this course yet.</p>
                    </div>
                ) : (
                    <>
                        <div style={statsContainerStyle}>
                            <div style={statCardStyle}>
                                <span style={statLabelStyle}>Total Students</span>
                                <span style={statValueStyle}>{students.length}</span>
                            </div>
                        </div>
                        <div style={listStyle}>
                            {students.map(student => (
                                <div key={student.id} style={listItemStyle}>
                                    <div style={avatarStyle}>
                                        {student.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={studentInfoStyle}>
                                        <h3 style={studentNameStyle}>{student.username}</h3>
                                        <p style={studentEmailStyle}>{student.email}</p>
                                        <p style={studentRoleStyle}>Role: {student.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

const containerStyle = {
    padding: '30px',
    maxWidth: '1200px',
    margin: '20px auto',
    background: 'linear-gradient(135deg, #ffffff, #f0f8ff)',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    border: '1px solid rgba(176, 224, 230, 0.3)'
};

const headerContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
};

const headerStyle = {
    color: '#2c3e50',
    margin: '0',
    fontSize: '2.2em',
    fontWeight: '600',
    background: 'linear-gradient(120deg, #2c3e50, #3498db)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
};

const backButtonStyle = {
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'all 0.3s ease',
    ':hover': {
        backgroundColor: '#2980b9',
        transform: 'translateY(-2px)'
    }
};

const statsContainerStyle = {
    marginBottom: '30px'
};

const statCardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
};

const statLabelStyle = {
    color: '#666',
    fontSize: '0.9em',
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const statValueStyle = {
    color: '#2c3e50',
    fontSize: '2em',
    fontWeight: '600'
};

const listStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    padding: '20px 0'
};

const listItemStyle = {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    cursor: 'default',
    ':hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }
};

const avatarStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5em',
    fontWeight: '600'
};

const studentInfoStyle = {
    flex: 1
};

const studentNameStyle = {
    margin: '0 0 5px 0',
    fontSize: '1.2em',
    color: '#2c3e50',
    fontWeight: '600'
};

const studentEmailStyle = {
    margin: '0 0 5px 0',
    color: '#666',
    fontSize: '0.9em'
};

const studentRoleStyle = {
    margin: '0',
    color: '#3498db',
    fontSize: '0.85em',
    textTransform: 'capitalize'
};

const emptyStateStyle = {
    textAlign: 'center',
    color: '#666',
    padding: '40px 20px',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
};

const emptyStateIconStyle = {
    fontSize: '3em',
    color: '#3498db',
    marginBottom: '20px'
};

const loadingStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    color: '#3498db',
    fontSize: '1.2em'
};

const spinnerStyle = {
    width: '25px',
    height: '25px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    '@keyframes spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' }
    }
};

const errorStyle = {
    color: '#e74c3c',
    textAlign: 'center',
    padding: '20px',
    background: '#fdf0ef',
    borderRadius: '8px',
    marginBottom: '20px'
};

export default CourseStudentsPage;