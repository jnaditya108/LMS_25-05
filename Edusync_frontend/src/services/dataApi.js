// src/services/dataApi.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5121/api';

// Create axios instance with default config
const API = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add auth token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token expiration
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Clear local storage and redirect to login
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// --- Auth Endpoints ---
export const login = (credentials) => {
    return API.post('/auth/login', credentials);
};

export const register = (userData) => {
    return API.post('/auth/register', userData);
};

// --- Course Endpoints ---
export const getCourses = () => {
    return API.get('/courses');
};

export const createCourse = (formData) => {
    return API.post('/courses', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const updateCourse = (courseId, formData) => {
    return API.put(`/courses/${courseId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const deleteCourse = (courseId) => {
    return API.delete(`/courses/${courseId}`);
};

// --- Enrollment Endpoints ---
export const getEnrolledCourses = (userId) => {
    return API.get(`/enrollments/student/${userId}`);
};

export const enrollInCourse = (enrollmentData) => {
    return API.post('/enrollments', enrollmentData);
};

// --- Assessment Endpoints ---
export const getAssessments = () => {
    return API.get('/assessments');
};

export const getStudentAssessments = (userId) => {
    return API.get(`/assessments/student/${userId}`);
};

export const getAssessment = (assessmentId) => {
    return API.get(`/assessments/${assessmentId}`);
};

export const getAssessmentQuestions = (assessmentId) => {
    return API.get(`/assessments/${assessmentId}/questions`);
};

export const submitAssessment = (assessmentId, answers) => {
    return API.post(`/assessments/${assessmentId}/submit`, answers);
};

export const getAssessmentResult = (assessmentId, userId) => {
    return API.get(`/assessments/${assessmentId}/result/${userId}`);
};

export default API;