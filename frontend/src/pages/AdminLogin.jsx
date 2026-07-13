import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { adminLogin } from '../services/authService'
import useAuth from '../hooks/useAuth'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await adminLogin(username, password)
      login(res.data.token, res.data.role, res.data.username)
      toast.success('Welcome back, admin!')
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card auth-card p-4">
        <div className="text-center mb-3">
          <i className="bi bi-shield-lock-fill text-primary" style={{ fontSize: '2.5rem' }}></i>
          <h4 className="mt-2 fw-bold">Admin Login</h4>
          <p className="text-muted small">Default: admin / admin123</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-center mt-3">
          <a href="/" className="small text-decoration-none">
            <i className="bi bi-arrow-left me-1"></i>Back to user login
          </a>
        </div>
      </div>
    </div>
  )
}
