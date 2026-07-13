import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import UserLogin from './pages/UserLogin'
import Register from './pages/Register'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import CreateQuiz from './pages/CreateQuiz'
import ManageQuiz from './pages/ManageQuiz'
import ManageQuestions from './pages/ManageQuestions'
import AdminResults from './pages/AdminResults'
import UserDashboard from './pages/UserDashboard'
import MyResults from './pages/MyResults'
import PreQuiz from './pages/PreQuiz'
import QuizPage from './pages/QuizPage'
import ResultPage from './pages/ResultPage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public / user auth */}
        <Route path="/" element={<UserLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* User routes */}
        <Route path="/user/dashboard" element={<ProtectedRoute role="USER"><UserDashboard /></ProtectedRoute>} />
        <Route path="/user/my-results" element={<ProtectedRoute role="USER"><MyResults /></ProtectedRoute>} />
        <Route path="/user/pre-quiz/:quizId" element={<ProtectedRoute role="USER"><PreQuiz /></ProtectedRoute>} />
        <Route path="/user/quiz/:quizId" element={<ProtectedRoute role="USER"><QuizPage /></ProtectedRoute>} />
        <Route path="/user/result/:resultId" element={<ProtectedRoute role="USER"><ResultPage /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/create-quiz" element={<ProtectedRoute role="ADMIN"><CreateQuiz /></ProtectedRoute>} />
        <Route path="/admin/manage-quiz" element={<ProtectedRoute role="ADMIN"><ManageQuiz /></ProtectedRoute>} />
        <Route path="/admin/manage-questions/:quizId" element={<ProtectedRoute role="ADMIN"><ManageQuestions /></ProtectedRoute>} />
        <Route path="/admin/results" element={<ProtectedRoute role="ADMIN"><AdminResults /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}
