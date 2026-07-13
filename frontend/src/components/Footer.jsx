import React from 'react'

export default function Footer() {
  return (
    <footer className="text-center text-muted small py-3 border-top bg-white">
      &copy; {new Date().getFullYear()} Online Quiz Management System
    </footer>
  )
}
