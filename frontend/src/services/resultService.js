import api from './api'

export const submitResult = (payload) =>
  api.post('/results/submit', payload).then((res) => res.data)

export const getResultById = (id) =>
  api.get(`/results/${id}`).then((res) => res.data)

export const getMyResults = () =>
  api.get('/results/my').then((res) => res.data)

export const getAllResults = (search = '', page = 0, size = 10) =>
  api.get('/results', { params: { search, page, size } }).then((res) => res.data)

export const deleteResult = (id) =>
  api.delete(`/results/${id}`).then((res) => res.data)

export const publishResult = (id) =>
  api.post(`/results/${id}/publish`).then((res) => res.data)

export const unpublishResult = (id) =>
  api.post(`/results/${id}/unpublish`).then((res) => res.data)
