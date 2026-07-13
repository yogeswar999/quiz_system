import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container text-center py-5">
      <h1 className="display-1 text-primary fw-bold">404</h1>
      <p className="text-muted">Page not found</p>
      <Link to="/" className="btn btn-primary mt-2">Go Home</Link>
    </div>
  )
}
