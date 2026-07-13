import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LoadingSpinner from '../components/LoadingSpinner'
import { getQuizById, getAccessStatus } from '../services/quizService'

export default function PreQuiz() {
  const { quizId } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [quizRes, accessRes] = await Promise.all([
          getQuizById(quizId),
          getAccessStatus(quizId),
        ])
        setQuiz(quizRes.data)
        setLocked(accessRes.data.locked)
      } catch (err) {
        toast.error('Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [quizId])

  if (loading) return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar /><LoadingSpinner /><Footer />
    </div>
  )

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container flex-grow-1 py-4">
        <div className="card quiz-card p-4 mx-auto" style={{ maxWidth: 600 }}>
          <h4 className="fw-bold">{quiz.subject}</h4>
          <p className="text-muted">{quiz.description}</p>
          <ul className="list-group list-group-flush mb-3">
            <li className="list-group-item d-flex justify-content-between">
              <span>Duration</span><b>{quiz.duration} minutes</b>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Total Marks</span><b>{quiz.totalMarks}</b>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Total Questions</span><b>{quiz.actualQuestionCount}</b>
            </li>
          </ul>

          {locked ? (
            <div className="alert alert-danger small">
              <b><i className="bi bi-lock-fill me-1"></i>This quiz is locked.</b>
              <p className="mb-0 mt-1">
                You've already attempted this quiz. Please contact your admin to unlock it before you can retake it.
              </p>
            </div>
          ) : (
            <div className="alert alert-warning small">
              <b><i className="bi bi-exclamation-triangle me-1"></i>Instructions:</b>
              <ul className="mb-0 mt-2">
                <li>Do not switch tabs or minimize the window — you get 3 warnings before auto-submit.</li>
                <li>Do not refresh the page during the test.</li>
                <li>Right-click, copy, and paste are disabled during the test.</li>
                <li>The test will auto-submit when the timer reaches zero.</li>
                <li>You can only attempt this quiz once unless an admin unlocks it for you.</li>
              </ul>
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            disabled={locked}
            onClick={() => navigate(`/user/quiz/${quiz.id}`)}
          >
            <i className="bi bi-play-fill me-1"></i>
            {locked ? 'Locked' : 'Start Test'}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
