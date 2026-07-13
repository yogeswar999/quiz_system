import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LoadingSpinner from '../components/LoadingSpinner'
import { getMyResults } from '../services/resultService'

export default function MyResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyResults()
        setResults(res.data)
      } catch (err) {
        toast.error('Failed to load your results')
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
        <h3 className="fw-bold mb-4">My Results</h3>

        {loading ? <LoadingSpinner /> : (
          <div className="card quiz-card p-3">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Subject</th><th>Status</th><th>Result</th><th>Submitted</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id}>
                      <td>{r.subject}</td>
                      <td>
                        {r.published ? (
                          <span className="badge bg-success">Published</span>
                        ) : (
                          <span className="badge bg-warning text-dark">
                            <i className="bi bi-hourglass-split me-1"></i>Pending
                          </span>
                        )}
                      </td>
                      <td>
                        {r.published ? (
                          <span className={`badge ${r.passed ? 'bg-success' : 'bg-danger'}`}>
                            {r.passed ? 'Pass' : 'Fail'}
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>{new Date(r.submissionTime).toLocaleString()}</td>
                      <td className="text-end">
                        <Link to={`/user/result/${r.id}`} className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-eye me-1"></i>View
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {results.length === 0 && (
                    <tr><td colSpan="5" className="text-center text-muted py-4">You haven't taken any quizzes yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
