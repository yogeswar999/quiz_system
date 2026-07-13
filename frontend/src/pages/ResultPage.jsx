import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LoadingSpinner from '../components/LoadingSpinner'
import { getResultById } from '../services/resultService'

export default function ResultPage() {
  const { resultId } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getResultById(resultId)
        setResult(res.data)
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load result')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [resultId])

  if (loading) return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar /><LoadingSpinner /><Footer />
    </div>
  )

  if (!result) return null

  // Score fields come back as null from the backend until an admin publishes the result.
  const isPending = !result.published

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container flex-grow-1 py-4">
        <div className="card quiz-card p-4 mx-auto text-center" style={{ maxWidth: 600 }}>
          {isPending ? (
            <>
              <i className="bi bi-hourglass-split text-primary" style={{ fontSize: '3rem' }}></i>
              <h3 className="fw-bold mt-2">Test Submitted Successfully!</h3>
              <p className="text-muted">{result.subject}</p>
              <div className="alert alert-info small mt-3">
                Your answers have been recorded. Your score will be available once your admin
                publishes the result — check back later or visit <b>My Results</b>.
              </div>
              <p className="small text-muted mb-0">
                Submitted at {new Date(result.submissionTime).toLocaleString()}
              </p>
            </>
          ) : (
            <>
              <i className={`bi ${result.passed ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'}`} style={{ fontSize: '3rem' }}></i>
              <h3 className="fw-bold mt-2">{result.passed ? 'Congratulations! You Passed' : 'You Did Not Pass'}</h3>
              <p className="text-muted">{result.subject}</p>

              <div className="row text-start mt-4">
                <div className="col-6 mb-3"><span className="text-muted small">Email</span><br /><b>{result.email}</b></div>
                <div className="col-6 mb-3"><span className="text-muted small">Total Questions</span><br /><b>{result.totalQuestions}</b></div>
                <div className="col-6 mb-3"><span className="text-muted small">Correct Answers</span><br /><b className="text-success">{result.correctAnswers}</b></div>
                <div className="col-6 mb-3"><span className="text-muted small">Wrong Answers</span><br /><b className="text-danger">{result.wrongAnswers}</b></div>
                <div className="col-6 mb-3"><span className="text-muted small">Marks Obtained</span><br /><b>{result.marksObtained} / {result.totalMarks}</b></div>
                <div className="col-6 mb-3"><span className="text-muted small">Percentage</span><br /><b>{result.percentage}%</b></div>
                <div className="col-6 mb-3"><span className="text-muted small">Time Taken</span><br /><b>{Math.floor(result.timeTakenSeconds / 60)}m {result.timeTakenSeconds % 60}s</b></div>
                <div className="col-6 mb-3"><span className="text-muted small">Submitted At</span><br /><b>{new Date(result.submissionTime).toLocaleString()}</b></div>
              </div>
            </>
          )}

          <div className="d-flex gap-2 justify-content-center mt-2">
            <Link to="/user/dashboard" className="btn btn-outline-primary">
              <i className="bi bi-house me-1"></i>Dashboard
            </Link>
            <Link to="/user/my-results" className="btn btn-primary">
              <i className="bi bi-list-check me-1"></i>My Results
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
