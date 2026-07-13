import api from './api'

export const getAllQuizzes = (search = '', page = 0, size = 10) =>
  api.get('/quizzes', { params: { search, page, size } }).then((res) => res.data)

export const getQuizById = (id) =>
  api.get(`/quizzes/${id}`).then((res) => res.data)

export const createQuiz = (payload) =>
  api.post('/quizzes', payload).then((res) => res.data)

export const updateQuiz = (id, payload) =>
  api.put(`/quizzes/${id}`, payload).then((res) => res.data)

export const deleteQuiz = (id) =>
  api.delete(`/quizzes/${id}`).then((res) => res.data)

export const getQuestionsForUser = (quizId) =>
  api.get(`/quizzes/${quizId}/questions-for-user`).then((res) => res.data)

export const getAccessStatus = (quizId) =>
  api.get(`/quizzes/${quizId}/access-status`).then((res) => res.data)
