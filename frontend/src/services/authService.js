import api from './api'

export const adminLogin = (username, password) =>
  api.post('/auth/admin/login', { username, password }).then((res) => res.data)

export const registerUser = (email, password) =>
  api.post('/auth/register', { email, password }).then((res) => res.data)

export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password }).then((res) => res.data)
