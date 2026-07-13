import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { loginUser } from '../services/authService'
import useAuth from '../hooks/useAuth'

export default function UserLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await loginUser(email, password)
      login(res.data.token, res.data.role, res.data.username)
      toast.success('Login successful!')
      navigate('/user/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card auth-card p-4">
        <div className="text-center mb-3">
          <i className="bi bi-mortarboard-fill text-primary" style={{ fontSize: '2.5rem' }}></i>
          <h4 className="mt-2 fw-bold">Welcome to Quiz Portal</h4>
          <p className="text-muted small">Login to take a quiz</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-center mt-3">
          <span className="small text-muted">Don't have an account? </span>
          <Link to="/register" className="small text-decoration-none">Register</Link>
        </div>
        <div className="text-center mt-2">
          <Link to="/admin/login" className="small text-decoration-none">
            <i className="bi bi-shield-lock me-1"></i>Admin Login
          </Link>
        </div>
      </div>
    </div>
  )
}
