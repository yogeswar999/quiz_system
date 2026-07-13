import React from 'react'

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border text-primary" role="status"></div>
      <span className="text-muted mt-2 small">{text}</span>
    </div>
  )
}
