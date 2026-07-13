import api from './api'

export const unlockQuizAttempt = (lockId) =>
  api.post(`/quiz-access/${lockId}/unlock`).then((res) => res.data)
