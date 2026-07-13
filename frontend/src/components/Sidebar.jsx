import React from 'react'
import { NavLink } from 'react-router-dom'

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { to: '/admin/create-quiz', label: 'Create Quiz', icon: 'bi-plus-circle' },
  { to: '/admin/manage-quiz', label: 'Manage Quiz', icon: 'bi-collection' },
  { to: '/admin/results', label: 'View Results', icon: 'bi-bar-chart-line' },
]

export default function Sidebar() {
  return (
    <div className="app-sidebar p-3" style={{ width: 240 }}>
      <ul className="nav nav-pills flex-column">
        {adminLinks.map((link) => (
          <li className="nav-item" key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              <i className={`bi ${link.icon} me-2`}></i>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
