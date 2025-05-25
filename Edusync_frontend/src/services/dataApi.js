// src/services/dataApi.js

import axios from 'axios';

// Create an Axios instance configured for your backend API
const dataApi = axios.create({
    baseURL: 'http://localhost:5121/api', // Your backend API base URL - IMPORTANT: Keep your base URL as 5121
});

// Add a request interceptor to include the JWT token in headers
dataApi.interceptors.request.use(
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

// Add a response interceptor to handle token expiration or invalid tokens
dataApi.interceptors.response.use(
    (response) => response,
    (error) => {
        // If the server responds with a 401 Unauthorized or 403 Forbidden,
        // it likely means the token is invalid or expired.
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn('Unauthorized or Forbidden response received. Clearing token and redirecting to login.');
            localStorage.clear(); // Clear local storage (token, role, etc.)
            // Use window.location.href to force a full page reload and clear React state
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// --- Student Endpoints (Examples, adjust based on your actual backend) ---
// These specific named exports are retained from your previous dataApi.js
// They use the 'dataApi' instance created above.

export const getAssessments = () => {
    return dataApi.get('/assessments');
};

export const getCourses = () => {
    return dataApi.get('/courses');
};

// --- Educator Endpoints (Examples, adjust based on your actual backend) ---

export const getAssessmentQuestions = () => {
    // Note: Your backend's AssessmentsController has a route like /assessments/{assessmentId}/questions
    // A /questions endpoint might not exist directly. You might need to fetch by assessmentId.
    // For now, this will call /api/questions. If it gives 404, we'll adjust when managing questions.
    return dataApi.get('/questions');
};

export const manageAssessments = () => {
    // This is an example endpoint. Confirm your backend API has this.
    // Otherwise, you might fetch assessments directly and then perform CUD operations.
    return dataApi.get('/assessments/manage');
};

// IMPORTANT: Export the configured Axios instance as the DEFAULT export
// This is what CourseForm.jsx and EducatorDashboard.js are expecting.
export default dataApi;