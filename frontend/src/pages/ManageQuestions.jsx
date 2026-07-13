import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import AdminLayout from '../components/AdminLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmDialog from '../components/ConfirmDialog'
import BulkAddModal from '../components/BulkAddModal'
import { getQuizById } from '../services/quizService'
import { getQuestionsByQuiz, addQuestion, updateQuestion, deleteQuestion } from '../services/questionService'

const emptyForm = { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: 10 }

export default function ManageQuestions() {
  const { quizId } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showBulkAdd, setShowBulkAdd] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [quizRes, qRes] = await Promise.all([
        getQuizById(quizId),
        getQuestionsByQuiz(quizId, search),
      ])
      setQuiz(quizRes.data)
      setQuestions(qRes.data)
    } catch (err) {
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [quizId])

  const handleSearch = (e) => {
    e.preventDefault()
    load()
  }

  const openAddForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  const openEditForm = (q) => {
    setForm({ ...q })
    setEditingId(q.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, quizId: Number(quizId), marks: Number(form.marks) }
      if (editingId) {
        await updateQuestion(editingId, payload)
        toast.success('Question updated')
      } else {
        await addQuestion(payload)
        toast.success('Question added')
      }
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save question')
    }
  }

  const confirmDelete = async () => {
    try {
      await deleteQuestion(deleteId)
      toast.success('Question deleted')
      setDeleteId(null)
      load()
    } catch (err) {
      toast.error('Failed to delete question')
    }
  }

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>

  return (
    <AdminLayout>
      <Link to="/admin/manage-quiz" className="text-decoration-none small mb-2 d-inline-block">
        <i className="bi bi-arrow-left me-1"></i>Back to Manage Quiz
      </Link>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0">Questions — {quiz?.subject}</h3>
        <div>
          <button className="btn btn-outline-primary me-2" onClick={() => setShowBulkAdd(true)}>
            <i className="bi bi-clipboard-plus me-1"></i>Bulk Add
          </button>
          <button className="btn btn-primary" onClick={openAddForm}>
            <i className="bi bi-plus-circle me-1"></i>Add Question
          </button>
        </div>
      </div>

      <form className="d-flex mb-3" style={{ maxWidth: 350 }} onSubmit={handleSearch}>
        <input className="form-control me-2" placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn-outline-primary" type="submit"><i className="bi bi-search"></i></button>
      </form>

      <div className="card quiz-card p-3">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr><th>Question</th><th>Correct</th><th>Marks</th><th></th></tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td className="text-truncate" style={{ maxWidth: 400 }}>{q.questionText}</td>
                  <td><span className="badge bg-success">{q.correctAnswer}</span></td>
                  <td>{q.marks}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEditForm(q)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(q.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr><td colSpan="4" className="text-center text-muted py-4">No questions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        show={deleteId !== null}
        title="Delete Question"
        message="Are you sure you want to delete this question?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {showForm && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-3">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{editingId ? 'Edit Question' : 'Add Question'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Question Text</label>
                    <textarea className="form-control" rows="2" value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })} required />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-2">
                      <label className="form-label">Option A</label>
                      <input className="form-control" value={form.optionA} onChange={(e) => setForm({ ...form, optionA: e.target.value })} required />
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label">Option B</label>
                      <input className="form-control" value={form.optionB} onChange={(e) => setForm({ ...form, optionB: e.target.value })} required />
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label">Option C</label>
                      <input className="form-control" value={form.optionC} onChange={(e) => setForm({ ...form, optionC: e.target.value })} required />
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label">Option D</label>
                      <input className="form-control" value={form.optionD} onChange={(e) => setForm({ ...form, optionD: e.target.value })} required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6 mb-2">
                      <label className="form-label">Correct Answer</label>
                      <select className="form-select" value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label">Marks</label>
                      <input type="number" min="1" className="form-control" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} required />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showBulkAdd && (
        <BulkAddModal
          quizId={Number(quizId)}
          onClose={() => setShowBulkAdd(false)}
          onSaved={() => {
            setShowBulkAdd(false)
            load()
          }}
        />
      )}
    </AdminLayout>
  )
}
