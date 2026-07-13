import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import LoadingSpinner from '../components/LoadingSpinner'
import { getQuizById, getQuestionsForUser } from '../services/quizService'
import { submitResult } from '../services/resultService'
import useAuth from '../hooks/useAuth'

const MAX_WARNINGS = 3

export default function QuizPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { auth } = useAuth()

  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({}) // { questionId: 'A' }
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [warnings, setWarnings] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const startTimeRef = useRef(Date.now())
  const submittedRef = useRef(false)
  const timerRef = useRef(null)

  // ---------- Load quiz + questions ----------
  useEffect(() => {
    const load = async () => {
      try {
        const [quizRes, qRes] = await Promise.all([
          getQuizById(quizId),
          getQuestionsForUser(quizId),
        ])
        setQuiz(quizRes.data)
        setQuestions(qRes.data)
        setSecondsLeft(quizRes.data.duration * 60)
        startTimeRef.current = Date.now()
      } catch (err) {
        if (err.response?.status === 423) {
          toast.error(err.response?.data?.message || 'This quiz is locked. Contact your admin.')
        } else {
          toast.error('Failed to load quiz')
        }
        navigate('/user/dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [quizId])

  // ---------- Submit handler ----------
  const handleSubmit = useCallback(async (auto = false) => {
    if (submittedRef.current) return
    submittedRef.current = true
    setSubmitting(true)

    if (timerRef.current) clearInterval(timerRef.current)

    const timeTakenSeconds = Math.round((Date.now() - startTimeRef.current) / 1000)
    const answerList = questions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id] || null,
    }))

    try {
      const res = await submitResult({
        email: auth.username,
        quizId: Number(quizId),
        answers: answerList,
        timeTakenSeconds,
      })
      if (auto) {
        toast.info('Time up! Your test was auto-submitted.')
      } else {
        toast.success('Test submitted! Your result will be available once published by the admin.')
      }
      navigate(`/user/result/${res.data.id}`, { replace: true })
    } catch (err) {
      toast.error('Failed to submit quiz')
      submittedRef.current = false
      setSubmitting(false)
    }
  }, [answers, questions, quizId, auth, navigate])

  // ---------- Timer ----------
  useEffect(() => {
    if (loading) return
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [loading, handleSubmit])

  // ---------- Exam security: disable right-click / copy / paste / selection ----------
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault()
    document.addEventListener('contextmenu', preventDefault)
    document.addEventListener('copy', preventDefault)
    document.addEventListener('paste', preventDefault)
    document.addEventListener('cut', preventDefault)
    return () => {
      document.removeEventListener('contextmenu', preventDefault)
      document.removeEventListener('copy', preventDefault)
      document.removeEventListener('paste', preventDefault)
      document.removeEventListener('cut', preventDefault)
    }
  }, [])

  // ---------- Exam security: tab switch / window blur detection ----------
  useEffect(() => {
    const handleViolation = () => {
      if (submittedRef.current) return
      setWarnings((prev) => {
        const next = prev + 1
        if (next >= MAX_WARNINGS) {
          toast.error('Maximum tab-switch warnings reached. Auto-submitting.')
          handleSubmit(true)
        } else {
          toast.warning(`Tab switch detected. Remaining attempts: ${MAX_WARNINGS - next}`)
        }
        return next
      })
    }

    const onVisibilityChange = () => {
      if (document.hidden) handleViolation()
    }
    const onBlur = () => handleViolation()

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('blur', onBlur)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('blur', onBlur)
    }
  }, [handleSubmit])

  // ---------- Prevent refresh / navigation away ----------
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (submittedRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  if (loading) return <div className="no-select"><LoadingSpinner text="Loading quiz..." /></div>

  const question = questions[currentIndex]
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isLastQuestion = currentIndex === questions.length - 1

  const selectOption = (opt) => {
    setAnswers((prev) => ({ ...prev, [question.id]: opt }))
  }

  return (
    <div className="no-select" style={{ minHeight: '100vh', background: '#f5f8ff' }}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0">{quiz.subject}</h5>
          <span className={`badge timer-badge ${secondsLeft < 60 ? 'bg-danger' : 'bg-primary'}`}>
            <i className="bi bi-clock me-1"></i>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>

        <div className="progress mb-4" style={{ height: 6 }}>
          <div className="progress-bar" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

        {question && (
          <div className="card quiz-card p-4 mx-auto" style={{ maxWidth: 700 }}>
            <p className="text-muted small mb-1">Question {currentIndex + 1} of {questions.length} &middot; {question.marks} marks</p>
            <h5 className="mb-4">{question.questionText}</h5>

            <div className="d-flex flex-column gap-2">
              {['A', 'B', 'C', 'D'].map((opt) => {
                const text = question[`option${opt}`]
                const selected = answers[question.id] === opt
                return (
                  <div key={opt} className={`option-card ${selected ? 'selected' : ''}`} onClick={() => selectOption(opt)}>
                    <b className="me-2">{opt}.</b>{text}
                  </div>
                )
              })}
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button className="btn btn-outline-secondary" disabled={currentIndex === 0} onClick={() => setCurrentIndex((i) => i - 1)}>
                <i className="bi bi-arrow-left me-1"></i>Previous
              </button>

              {isLastQuestion ? (
                <button className="btn btn-success" disabled={submitting} onClick={() => handleSubmit(false)}>
                  {submitting ? 'Submitting...' : 'Submit Test'}
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => setCurrentIndex((i) => i + 1)}>
                  Next<i className="bi bi-arrow-right ms-1"></i>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="text-center text-muted small mt-3">
          <i className="bi bi-shield-exclamation me-1"></i>
          Tab-switch warnings used: {warnings} / {MAX_WARNINGS}
        </div>
      </div>
    </div>
  )
}
