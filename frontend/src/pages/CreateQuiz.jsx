import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { createQuiz } from '../services/quizService'

export default function CreateQuiz() {
  const [form, setForm] = useState({
    subject: '', duration: '', totalMarks: '', numberOfQuestions: '', description: '',
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createQuiz({
        ...form,
        duration: Number(form.duration),
        totalMarks: Number(form.totalMarks),
        numberOfQuestions: Number(form.numberOfQuestions),
      })
      toast.success('Quiz created successfully')
      navigate('/admin/manage-quiz')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <h3 className="fw-bold mb-4">Create Quiz</h3>
      <div className="card quiz-card p-4" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Subject</label>
            <input className="form-control" name="subject" value={form.subject} onChange={handleChange} required />
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Duration (mins)</label>
              <input type="number" min="1" className="form-control" name="duration" value={form.duration} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Total Marks</label>
              <input type="number" min="1" className="form-control" name="totalMarks" value={form.totalMarks} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label"># Questions</label>
              <input type="number" min="1" className="form-control" name="numberOfQuestions" value={form.numberOfQuestions} onChange={handleChange} required />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="3" name="description" value={form.description} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Quiz'}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
