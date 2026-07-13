import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { parseBulkQuestions, BULK_FORMAT_EXAMPLE } from '../utils/bulkQuestionParser'
import { addBulkQuestions } from '../services/questionService'

export default function BulkAddModal({ quizId, onClose, onSaved }) {
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState(null) // { questions, errors }
  const [saving, setSaving] = useState(false)

  const handlePreview = () => {
    const result = parseBulkQuestions(text)
    setParsed(result)
    if (result.questions.length === 0 && result.errors.length === 0) {
      toast.error('No questions found in the pasted text')
    }
  }

  const handleLoadExample = () => {
    setText(BULK_FORMAT_EXAMPLE)
    setParsed(null)
  }

  const handleSave = async () => {
    if (!parsed || parsed.questions.length === 0) return
    setSaving(true)
    try {
      const res = await addBulkQuestions(quizId, parsed.questions)
      toast.success(res.message || 'Questions added successfully')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add questions')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-3">
          <div className="modal-header">
            <h5 className="modal-title"><i className="bi bi-clipboard-plus me-2"></i>Bulk Add Questions</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p className="small text-muted mb-2">
              Paste multiple questions at once using this format — separate each question with a blank line:
            </p>
            <pre className="bg-light p-2 rounded small" style={{ whiteSpace: 'pre-wrap' }}>
{`Q: Your question text
A: Option A
B: Option B
C: Option C
D: Option D
Answer: C
Marks: 10`}
            </pre>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted">"Marks:" is optional — defaults to 10.</span>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleLoadExample}>
                Load Example
              </button>
            </div>

            <textarea
              className="form-control mb-3"
              rows={10}
              placeholder="Paste your questions here..."
              value={text}
              onChange={(e) => { setText(e.target.value); setParsed(null) }}
            />

            <button type="button" className="btn btn-outline-primary mb-3" onClick={handlePreview}>
              <i className="bi bi-eye me-1"></i>Preview
            </button>

            {parsed && (
              <div>
                {parsed.errors.length > 0 && (
                  <div className="alert alert-warning small">
                    <b>Some lines had issues:</b>
                    <ul className="mb-0 mt-1">
                      {parsed.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}
                {parsed.questions.length > 0 && (
                  <div className="alert alert-success small">
                    <b>{parsed.questions.length} question{parsed.questions.length !== 1 ? 's' : ''} ready to add.</b>
                    <ol className="mb-0 mt-1">
                      {parsed.questions.map((q, i) => (
                        <li key={i}>{q.questionText} <span className="text-muted">(Answer: {q.correctAnswer}, {q.marks} marks)</span></li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!parsed || parsed.questions.length === 0 || saving}
              onClick={handleSave}
            >
              {saving ? 'Saving...' : `Add ${parsed?.questions.length || ''} Question${parsed?.questions.length === 1 ? '' : 's'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
