import React, { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import { getAllQuizzes } from '../services/quizService'
import { getAllResults } from '../services/resultService'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [quizRes, resultRes] = await Promise.all([
          getAllQuizzes('', 0, 1),
          getAllResults('', 0, 1),
        ])
        setStats({
          totalQuizzes: quizRes.data.totalElements,
          totalResults: resultRes.data.totalElements,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>

  return (
    <AdminLayout>
      <h3 className="fw-bold mb-4">Admin Dashboard</h3>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card quiz-card p-4">
            <i className="bi bi-collection text-primary fs-2"></i>
            <h2 className="fw-bold mt-2">{stats.totalQuizzes}</h2>
            <p className="text-muted mb-0">Total Quizzes</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card quiz-card p-4">
            <i className="bi bi-bar-chart-line text-primary fs-2"></i>
            <h2 className="fw-bold mt-2">{stats.totalResults}</h2>
            <p className="text-muted mb-0">Quiz Attempts</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card quiz-card p-4">
            <i className="bi bi-person-check text-primary fs-2"></i>
            <h2 className="fw-bold mt-2">Admin</h2>
            <p className="text-muted mb-0">Logged in as Admin</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
