import React, { useState, useEffect } from 'react';
import axios from 'axios'; // For making API calls
import './QuestionManager.css'; // Don't forget to create this CSS file
import Navbar from './Navbar';

// Base URL for your API
// IMPORTANT: Replace with your actual API URL and port
const API_BASE_URL = 'http://localhost:5121/api';

const QuestionManager = ({ assessmentId }) => {
    // State to hold all questions fetched for the current assessment
    const [questions, setQuestions] = useState([]);
    // Loading state for API calls
    const [loading, setLoading] = useState(true);
    // State for displaying errors
    const [error, setError] = useState(null);

    // State for controlling the visibility of the "Add Question" form
    const [showAddForm, setShowAddForm] = useState(false);
    // State for controlling the visibility of the "Edit Question" form
    const [showEditForm, setShowEditForm] = useState(false);
    // State to hold the question currently being edited
    const [currentQuestion, setCurrentQuestion] = useState(null);

    // States for the "Add Question" form fields
    const [newQuestionText, setNewQuestionText] = useState('');
    const [newQuestionType, setNewQuestionType] = useState('MultipleChoice'); // Default type
    const [newOptions, setNewOptions] = useState([{ text: '', isCorrect: false }]); // Options for new MC question
    const [assessmentTitle, setAssessmentTitle] = useState('');

    // Effect hook to fetch questions whenever the assessmentId changes
    useEffect(() => {
        if (assessmentId) {
            fetchAssessmentDetails();
            fetchQuestions();
        }
    }, [assessmentId]); // Dependency array: re-run when assessmentId changes

    // Function to fetch questions from the API
    const fetchQuestions = async () => {
        setLoading(true); // Set loading state
        setError(null); // Clear any previous errors
        try {
            const response = await axios.get(`${API_BASE_URL}/Assessments/${assessmentId}/questions`);
            setQuestions(response.data); // Update questions state with fetched data
        } catch (err) {
            console.error('Error fetching questions:', err);
            setError('Failed to fetch questions. Please try again.'); // Set error message
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const fetchAssessmentDetails = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/Assessments/${assessmentId}`);
            setAssessmentTitle(response.data.title);
        } catch (err) {
            console.error('Error fetching assessment details:', err);
        }
    };

    // Handler for adding a new question
    const handleAddQuestion = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setError(null); // Clear previous errors

        // Basic frontend validation for question text
        if (!newQuestionText.trim()) {
            setError('Question text cannot be empty.');
            return;
        }
        // Basic frontend validation for multiple choice options
        if (newQuestionType === 'MultipleChoice') {
            if (newOptions.filter(opt => opt.text.trim() !== '').length === 0) {
                setError('Multiple choice questions need at least one option.');
                return;
            }
            if (newOptions.filter(opt => opt.isCorrect).length === 0) {
                setError('Multiple choice questions need at least one correct option.');
                return;
            }
        }

        try {
            // Prepare the data payload for the API
            const questionData = {
                text: newQuestionText,
                questionType: newQuestionType,
                assessmentId: assessmentId, // Foreign key for the assessment
                // Only send options if it's a MultipleChoice question, filter out empty text options
                options: newQuestionType === 'MultipleChoice' ? newOptions.filter(opt => opt.text.trim() !== '') : [],
            };

            // API call to add question (note: backend expects an array of questions)
            await axios.post(`${API_BASE_URL}/Assessments/${assessmentId}/questions`, [questionData]);

            // Reset form fields and hide the form
            setNewQuestionText('');
            setNewQuestionType('MultipleChoice');
            setNewOptions([{ text: '', isCorrect: false }]);
            setShowAddForm(false);
            fetchQuestions(); // Refresh the list of questions
        } catch (err) {
            console.error('Error adding question:', err);
            setError('Failed to add question. Please check your input.');
        }
    };

    // Handler for deleting a question
    const handleDeleteQuestion = async (questionId) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            try {
                // API call to delete question
                await axios.delete(`${API_BASE_URL}/Assessments/${assessmentId}/questions/${questionId}`);
                fetchQuestions(); // Refresh the list
            } catch (err) {
                console.error('Error deleting question:', err);
                setError('Failed to delete question. Please try again.');
            }
        }
    };

    // Handler for clicking the "Edit" button for a question
    const handleEditClick = (question) => {
        // Create a deep copy of the question and its options to prevent direct state mutation
        setCurrentQuestion({
            ...question,
            options: question.options ? question.options.map(opt => ({ ...opt })) : [{ text: '', isCorrect: false }]
        });
        setShowEditForm(true); // Show the edit form
    };

    // Handler for updating an existing question
    const handleUpdateQuestion = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setError(null); // Clear previous errors

        // Basic validation for the current question
        if (!currentQuestion || !currentQuestion.text.trim()) {
            setError('Question text cannot be empty.');
            return;
        }
        if (currentQuestion.questionType === 'MultipleChoice') {
            if (currentQuestion.options.filter(opt => opt.text.trim() !== '').length === 0) {
                setError('Multiple choice questions need at least one option.');
                return;
            }
            if (currentQuestion.options.filter(opt => opt.isCorrect).length === 0) {
                setError('Multiple choice questions need at least one correct option.');
                return;
            }
        }

        try {
            // Filter out options with empty text and ensure new options have ID 0
            const optionsToSend = currentQuestion.options
                .filter(opt => opt.text.trim() !== '') // Remove options with empty text
                .map(opt => ({
                    ...opt,
                    id: opt.id || 0, // Set ID to 0 for new options added on frontend, keep existing for others
                    questionId: currentQuestion.id // Ensure foreign key is set correctly
                }));

            // Prepare the data payload for the API
            const questionData = {
                id: currentQuestion.id,
                text: currentQuestion.text,
                questionType: currentQuestion.questionType,
                assessmentId: currentQuestion.assessmentId,
                options: currentQuestion.questionType === 'MultipleChoice' ? optionsToSend : [],
            };

            // API call to update question
            await axios.put(`${API_BASE_URL}/Assessments/${assessmentId}/questions/${currentQuestion.id}`, questionData);

            // Hide the form and reset current question
            setShowEditForm(false);
            setCurrentQuestion(null);
            fetchQuestions(); // Refresh the list
        } catch (err) {
            console.error('Error updating question:', err);
            setError('Failed to update question. Please check your input.');
        }
    };

    // --- Handlers for "Add Question" form options ---
    const handleNewOptionChange = (index, field, value) => {
        const updatedOptions = newOptions.map((option, i) =>
            i === index ? { ...option, [field]: value } : option
        );
        setNewOptions(updatedOptions);
    };

    const handleAddOption = () => {
        setNewOptions([...newOptions, { text: '', isCorrect: false }]);
    };

    const handleRemoveOption = (index) => {
        setNewOptions(newOptions.filter((_, i) => i !== index));
    };

    // --- Handlers for "Edit Question" form options ---
    const handleEditOptionChange = (index, field, value) => {
        const updatedOptions = currentQuestion.options.map((option, i) =>
            i === index ? { ...option, [field]: value } : option
        );
        setCurrentQuestion(prev => ({ ...prev, options: updatedOptions }));
    };

    const handleAddEditOption = () => {
        setCurrentQuestion(prev => ({
            ...prev,
            // Add a new option with ID 0 to signify it's new for the backend
            options: [...(prev.options || []), { id: 0, text: '', isCorrect: false, questionId: prev.id }]
        }));
    };

    const handleRemoveEditOption = (index) => {
        setCurrentQuestion(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    // --- Conditional Rendering based on component state ---
    if (!assessmentId) {
        return <div className="question-manager">Please provide an Assessment ID.</div>;
    }

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="question-manager">
                    <div className="loading">Loading questions...</div>
                </div>
            </>
        );
    }

    // Main render function for the component
    return (
        <>
            <Navbar />
            <div className="question-manager">
                <h2>{assessmentTitle} - Questions</h2>

                {/* Display error messages if any */}
                {error && <div className="error-message">{error}</div>}

                {/* Button to toggle the Add Question form */}
                <button 
                    className="add-question-btn"
                    onClick={() => {
                        setShowAddForm(!showAddForm);
                        setShowEditForm(false);
                        setCurrentQuestion(null);
                        setNewQuestionText('');
                        setNewQuestionType('MultipleChoice');
                        setNewOptions([{ text: '', isCorrect: false }]);
                    }}
                >
                    {showAddForm ? '− Cancel' : '+ Add Question'}
                </button>

                {/* Add Question Form (conditionally rendered) */}
                {showAddForm && (
                    <div className="form-container">
                        <h3>Add New Question</h3>
                        <form onSubmit={handleAddQuestion}>
                            <div>
                                <label>Question Text:</label>
                                <input
                                    type="text"
                                    value={newQuestionText}
                                    onChange={(e) => setNewQuestionText(e.target.value)}
                                    placeholder="Enter your question here"
                                    required
                                />
                            </div>
                            <div>
                                <label>Question Type:</label>
                                <select 
                                    value={newQuestionType} 
                                    onChange={(e) => {
                                        setNewQuestionType(e.target.value);
                                        setNewOptions([{ text: '', isCorrect: false }]);
                                    }}
                                >
                                    <option value="MultipleChoice">Multiple Choice</option>
                                    <option value="TrueFalse">True/False</option>
                                    <option value="ShortAnswer">Short Answer</option>
                                </select>
                            </div>

                            {newQuestionType === 'MultipleChoice' && (
                                <div className="options-container">
                                    <label>Options:</label>
                                    {newOptions.map((option, index) => (
                                        <div key={index} className="option-item">
                                            <input
                                                type="text"
                                                value={option.text}
                                                onChange={(e) => handleNewOptionChange(index, 'text', e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                            />
                                            <input
                                                type="checkbox"
                                                checked={option.isCorrect}
                                                onChange={(e) => handleNewOptionChange(index, 'isCorrect', e.target.checked)}
                                            />
                                            {newOptions.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="remove-option-btn"
                                                    onClick={() => setNewOptions(newOptions.filter((_, i) => i !== index))}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="add-option-btn"
                                        onClick={() => setNewOptions([...newOptions, { text: '', isCorrect: false }])}
                                    >
                                        + Add Option
                                    </button>
                                </div>
                            )}

                            <div className="question-actions">
                                <button type="submit">Save Question</button>
                                <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Edit Question Form (conditionally rendered) */}
                {showEditForm && currentQuestion && (
                    <div className="form-container">
                        <h3>Edit Question</h3>
                        <form onSubmit={handleUpdateQuestion}>
                            <div>
                                <label>Question Text:</label>
                                <input
                                    type="text"
                                    value={currentQuestion.text}
                                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, text: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label>Question Type:</label>
                                <select
                                    value={currentQuestion.questionType}
                                    onChange={(e) => {
                                        setCurrentQuestion(prev => ({
                                            ...prev,
                                            questionType: e.target.value,
                                            options: e.target.value === 'MultipleChoice' ? 
                                                (prev.options && prev.options.length > 0 ? prev.options : [{ id: 0, text: '', isCorrect: false, questionId: prev.id }]) : 
                                                []
                                        }));
                                    }}
                                >
                                    <option value="MultipleChoice">Multiple Choice</option>
                                    <option value="TrueFalse">True/False</option>
                                    <option value="ShortAnswer">Short Answer</option>
                                </select>
                            </div>

                            {currentQuestion.questionType === 'MultipleChoice' && (
                                <div className="options-container">
                                    <label>Options:</label>
                                    {currentQuestion.options.map((option, index) => (
                                        <div key={option.id || index} className="option-item">
                                            <input
                                                type="text"
                                                value={option.text}
                                                onChange={(e) => handleEditOptionChange(index, 'text', e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                            />
                                            <input
                                                type="checkbox"
                                                checked={option.isCorrect}
                                                onChange={(e) => handleEditOptionChange(index, 'isCorrect', e.target.checked)}
                                            />
                                            {currentQuestion.options.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="remove-option-btn"
                                                    onClick={() => setCurrentQuestion(prev => ({
                                                        ...prev,
                                                        options: prev.options.filter((_, i) => i !== index)
                                                    }))}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="add-option-btn"
                                        onClick={() => setCurrentQuestion(prev => ({
                                            ...prev,
                                            options: [...prev.options, { id: 0, text: '', isCorrect: false, questionId: prev.id }]
                                        }))}
                                    >
                                        + Add Option
                                    </button>
                                </div>
                            )}

                            <div className="question-actions">
                                <button type="submit">Update Question</button>
                                <button type="button" onClick={() => { setShowEditForm(false); setCurrentQuestion(null); }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List of current questions */}
                <h3>Current Questions</h3>
                {questions.length === 0 ? (
                    <div className="empty-state">No questions added yet. Click "Add Question" to get started.</div>
                ) : (
                    <div className="questions-list">
                        {questions.map((question) => (
                            <div key={question.id} className="question-item">
                                <strong>{question.text}</strong>
                                <p className="question-type">Type: {question.questionType}</p>
                                {question.options && question.options.length > 0 && (
                                    <ul className="options-list">
                                        {question.options.map((option) => (
                                            <li key={option.id} className={option.isCorrect ? 'correct-option' : ''}>
                                                <span className="option-text">{option.text}</span>
                                                {option.isCorrect && <span className="correct-badge">✓ Correct</span>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <div className="question-actions">
                                    <button onClick={() => handleEditClick(question)}>Edit</button>
                                    <button onClick={() => handleDeleteQuestion(question.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default QuestionManager;