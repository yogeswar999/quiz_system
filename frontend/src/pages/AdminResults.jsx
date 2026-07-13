import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import AdminLayout from '../components/AdminLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmDialog from '../components/ConfirmDialog'
import { getAllResults, deleteResult, publishResult, unpublishResult } from '../services/resultService'
import { unlockQuizAttempt } from '../services/quizAccessService'

export default function AdminResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [deleteId, setDeleteId] = useState(null)
  const [viewResult, setViewResult] = useState(null)
  const [unlockTarget, setUnlockTarget] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getAllResults(search, page, 10)
      setResults(res.data.content)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      toast.error('Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    load()
  }

  const confirmDelete = async () => {
    try {
      await deleteResult(deleteId)
      toast.success('Result deleted')
      setDeleteId(null)
      load()
    } catch (err) {
      toast.error('Failed to delete result')
    }
  }

  const confirmUnlock = async () => {
    try {
      await unlockQuizAttempt(unlockTarget.lockId)
      toast.success(`Quiz unlocked for ${unlockTarget.email}`)
      setUnlockTarget(null)
      load()
    } catch (err) {
      toast.error('Failed to unlock quiz')
    }
  }

  const togglePublish = async (result) => {
    setTogglingId(result.id)
    try {
      if (result.published) {
        await unpublishResult(result.id)
        toast.success(`Result hidden from ${result.email} again`)
      } else {
        await publishResult(result.id)
        toast.success(`Result published — ${result.email} can now see their score`)
      }
      load()
    } catch (err) {
      toast.error('Failed to update publish status')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <AdminLayout>
      <h3 className="fw-bold mb-4">Quiz Results</h3>

      <form className="d-flex mb-3" style={{ maxWidth: 350 }} onSubmit={handleSearch}>
        <input className="form-control me-2" placeholder="Search by email or subject..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn-outline-primary" type="submit"><i className="bi bi-search"></i></button>
      </form>

      {loading ? <LoadingSpinner /> : (
        <div className="card quiz-card p-3">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Email</th><th>Subject</th><th>Marks</th><th>%</th><th>Result</th><th>Access</th><th>Status</th><th>Date</th><th></th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id}>
                    <td>{r.email}</td>
                    <td>{r.subject}</td>
                    <td>{r.marksObtained} / {r.totalMarks}</td>
                    <td>{r.percentage}%</td>
                    <td>
                      <span className={`badge ${r.passed ? 'bg-success' : 'bg-danger'}`}>
                        {r.passed ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                    <td>
                      {r.locked ? (
                        <span className="badge bg-danger"><i className="bi bi-lock-fill me-1"></i>Locked</span>
                      ) : (
                        <span className="badge bg-success"><i className="bi bi-unlock-fill me-1"></i>Unlocked</span>
                      )}
                    </td>
                    <td>
                      {r.published ? (
                        <span className="badge bg-success">Published</span>
                      ) : (
                        <span className="badge bg-warning text-dark">Pending</span>
                      )}
                    </td>
                    <td>{new Date(r.submissionTime).toLocaleString()}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setViewResult(r)}>
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        className={`btn btn-sm me-1 ${r.published ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        disabled={togglingId === r.id}
                        onClick={() => togglePublish(r)}
                      >
                        <i className={`bi ${r.published ? 'bi-eye-slash' : 'bi-send-check'} me-1`}></i>
                        {r.published ? 'Unpublish' : 'Publish'}
                      </button>
                      {r.locked && (
                        <button
                          className="btn btn-sm btn-outline-success me-1"
                          onClick={() => setUnlockTarget({ lockId: r.lockId, email: r.email })}
                        >
                          <i className="bi bi-unlock"></i> Unlock
                        </button>
                      )}
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(r.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr><td colSpan="9" className="text-center text-muted py-4">No results found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav className="d-flex justify-content-center mt-2">
              <ul className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i} className={`page-item ${i === page ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i)}>{i + 1}</button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      )}

      <ConfirmDialog
        show={deleteId !== null}
        title="Delete Result"
        message="Are you sure you want to delete this result?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {unlockTarget && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3">
              <div className="modal-header">
                <h5 className="modal-title">Unlock Quiz</h5>
                <button type="button" className="btn-close" onClick={() => setUnlockTarget(null)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">
                  Allow <b>{unlockTarget.email}</b> to retake this quiz? They'll be able to attempt it
                  one more time, and it will lock again after they submit.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setUnlockTarget(null)}>Cancel</button>
                <button className="btn btn-success" onClick={confirmUnlock}>
                  <i className="bi bi-unlock me-1"></i>Unlock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewResult && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3">
              <div className="modal-header">
                <h5 className="modal-title">Result Details</h5>
                <button type="button" className="btn-close" onClick={() => setViewResult(null)}></button>
              </div>
              <div className="modal-body">
                <p><b>Email:</b> {viewResult.email}</p>
                <p><b>Subject:</b> {viewResult.subject}</p>
                <p><b>Total Questions:</b> {viewResult.totalQuestions}</p>
                <p><b>Correct:</b> {viewResult.correctAnswers} &nbsp; <b>Wrong:</b> {viewResult.wrongAnswers}</p>
                <p><b>Marks:</b> {viewResult.marksObtained} / {viewResult.totalMarks}</p>
                <p><b>Percentage:</b> {viewResult.percentage}%</p>
                <p><b>Result:</b> {viewResult.passed ? 'Pass' : 'Fail'}</p>
                <p><b>Access:</b> {viewResult.locked ? 'Locked' : 'Unlocked'}</p>
                <p><b>Status:</b> {viewResult.published ? 'Published' : 'Pending'}</p>
                <p><b>Submitted:</b> {new Date(viewResult.submissionTime).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
