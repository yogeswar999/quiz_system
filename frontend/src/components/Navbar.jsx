import React from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function Navbar() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm px-3">
      <span className="navbar-brand">
        <i className="bi bi-mortarboard-fill me-2"></i>
        Quiz Management System
      </span>
      <div className="ms-auto d-flex align-items-center gap-3">
        {auth && (
          <>
            <span className="text-muted small">
              <i className="bi bi-person-circle me-1"></i>
              {auth.username} ({auth.role})
            </span>
            <button className="btn btn-outline-primary btn-sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
