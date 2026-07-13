import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LoadingSpinner from '../components/LoadingSpinner'
import { getAllQuizzes, getAccessStatus } from '../services/quizService'
import useAuth from '../hooks/useAuth'

export default function UserDashboard() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { auth } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllQuizzes('', 0, 50)
        const list = res.data.content

        // Check lock status for each quiz in parallel.
        const withLockStatus = await Promise.all(
          list.map(async (q) => {
            try {
              const accessRes = await getAccessStatus(q.id)
              return { ...q, locked: accessRes.data.locked }
            } catch {
              return { ...q, locked: false }
            }
          })
        )
        setQuizzes(withLockStatus)
      } catch (err) {
        toast.error('Failed to load quizzes')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container flex-grow-1 py-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h3 className="fw-bold mb-0">Welcome, {auth?.username}!</h3>
            <p className="text-muted">Choose a quiz below to get started.</p>
          </div>
          <Link to="/user/my-results" className="btn btn-outline-primary mb-3">
            <i className="bi bi-list-check me-1"></i>My Results
          </Link>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="row g-4 mt-2">
            {quizzes.map((q) => (
              <div className="col-md-4" key={q.id}>
                <div className="card quiz-card p-4 h-100 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="fw-bold">{q.subject}</h5>
                    {q.locked && <span className="badge bg-danger"><i className="bi bi-lock-fill me-1"></i>Locked</span>}
                  </div>
                  <p className="text-muted small flex-grow-1">{q.description}</p>
                  <ul className="list-unstyled small text-muted mb-3">
                    <li><i className="bi bi-clock me-1"></i>{q.duration} minutes</li>
                    <li><i className="bi bi-award me-1"></i>{q.totalMarks} marks</li>
                    <li><i className="bi bi-question-circle me-1"></i>{q.actualQuestionCount} questions</li>
                  </ul>
                  <button
                    className="btn btn-primary"
                    disabled={q.locked}
                    onClick={() => navigate(`/user/pre-quiz/${q.id}`)}
                  >
                    {q.locked ? 'Locked — contact admin' : 'Start Test'}
                  </button>
                </div>
              </div>
            ))}
            {quizzes.length === 0 && (
              <p className="text-muted text-center py-5">No quizzes available right now. Check back later!</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
