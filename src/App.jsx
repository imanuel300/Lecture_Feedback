import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FeedbackForm from './components/FeedbackForm';
import ResultsPage from './components/ResultsPage';
import LectureManager from './components/LectureManager';
import AdminLogin from './components/AdminLogin';
import './styles/main.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/feedback" replace />} />
        <Route path="/feedback" element={<Navigate to="/admin" replace />} />
        <Route path="/feedback/:lectureCode" element={<FeedbackForm />} />
        <Route path="/results/:lectureCode" element={<ResultsPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/lectures" element={<LectureManager />} />
      </Routes>
    </Router>
  );
};

export default App; 