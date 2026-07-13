import api from './api'

export const getQuestionsByQuiz = (quizId, search = '') =>
  api.get(`/questions/quiz/${quizId}`, { params: { search } }).then((res) => res.data)

export const addQuestion = (payload) =>
  api.post('/questions', payload).then((res) => res.data)

export const updateQuestion = (id, payload) =>
  api.put(`/questions/${id}`, payload).then((res) => res.data)

export const deleteQuestion = (id) =>
  api.delete(`/questions/${id}`).then((res) => res.data)

export const addBulkQuestions = (quizId, questions) =>
  api.post('/questions/bulk', { quizId, questions }).then((res) => res.data)
