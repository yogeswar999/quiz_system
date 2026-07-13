import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import AdminLayout from '../components/AdminLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmDialog from '../components/ConfirmDialog'
import { getAllQuizzes, deleteQuiz, updateQuiz } from '../services/quizService'

export default function ManageQuiz() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [deleteId, setDeleteId] = useState(null)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      const res = await getAllQuizzes(search, page, 10)
      setQuizzes(res.data.content)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      toast.error('Failed to load quizzes')
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
      await deleteQuiz(deleteId)
      toast.success('Quiz deleted')
      setDeleteId(null)
      load()
    } catch (err) {
      toast.error('Failed to delete quiz')
    }
  }

  const handleEditSave = async (e) => {
    e.preventDefault()
    try {
      await updateQuiz(editingQuiz.id, {
        subject: editingQuiz.subject,
        duration: Number(editingQuiz.duration),
        totalMarks: Number(editingQuiz.totalMarks),
        numberOfQuestions: Number(editingQuiz.numberOfQuestions),
        description: editingQuiz.description,
      })
      toast.success('Quiz updated')
      setEditingQuiz(null)
      load()
    } catch (err) {
      toast.error('Failed to update quiz')
    }
  }

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Manage Quiz</h3>
        <Link to="/admin/create-quiz" className="btn btn-primary">
          <i className="bi bi-plus-circle me-1"></i>New Quiz
        </Link>
      </div>

      <form className="d-flex mb-3" style={{ maxWidth: 350 }} onSubmit={handleSearch}>
        <input className="form-control me-2" placeholder="Search by subject..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn-outline-primary" type="submit"><i className="bi bi-search"></i></button>
      </form>

      {loading ? <LoadingSpinner /> : (
        <div className="card quiz-card p-3">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Subject</th><th>Duration</th><th>Marks</th><th>Questions</th><th>Description</th><th></th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q) => (
                  <tr key={q.id}>
                    <td>{q.subject}</td>
                    <td>{q.duration} min</td>
                    <td>{q.totalMarks}</td>
                    <td>{q.actualQuestionCount} / {q.numberOfQuestions}</td>
                    <td className="text-truncate" style={{ maxWidth: 200 }}>{q.description}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => navigate(`/admin/manage-questions/${q.id}`)}>
                        <i className="bi bi-list-task"></i> Questions
                      </button>
                      <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setEditingQuiz(q)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(q.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {quizzes.length === 0 && (
                  <tr><td colSpan="6" className="text-center text-muted py-4">No quizzes found</td></tr>
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
        title="Delete Quiz"
        message="Are you sure you want to delete this quiz and all its questions?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {editingQuiz && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3">
              <form onSubmit={handleEditSave}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Quiz</h5>
                  <button type="button" className="btn-close" onClick={() => setEditingQuiz(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Subject</label>
                    <input className="form-control" value={editingQuiz.subject} onChange={(e) => setEditingQuiz({ ...editingQuiz, subject: e.target.value })} required />
                  </div>
                  <div className="row">
                    <div className="col-4 mb-2">
                      <label className="form-label">Duration</label>
                      <input type="number" className="form-control" value={editingQuiz.duration} onChange={(e) => setEditingQuiz({ ...editingQuiz, duration: e.target.value })} required />
                    </div>
                    <div className="col-4 mb-2">
                      <label className="form-label">Marks</label>
                      <input type="number" className="form-control" value={editingQuiz.totalMarks} onChange={(e) => setEditingQuiz({ ...editingQuiz, totalMarks: e.target.value })} required />
                    </div>
                    <div className="col-4 mb-2">
                      <label className="form-label"># Questions</label>
                      <input type="number" className="form-control" value={editingQuiz.numberOfQuestions} onChange={(e) => setEditingQuiz({ ...editingQuiz, numberOfQuestions: e.target.value })} required />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="2" value={editingQuiz.description || ''} onChange={(e) => setEditingQuiz({ ...editingQuiz, description: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setEditingQuiz(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
