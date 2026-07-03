import api from './client';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

export const userService = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
};

export const bookService = {
  list: (params) => api.get('/books', { params }),
  get: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  remove: (id) => api.delete(`/books/${id}`),
  categories: () => api.get('/books/categories'),
};

export const readerService = {
  list: (params) => api.get('/readers', { params }),
  get: (id) => api.get(`/readers/${id}`),
  create: (data) => api.post('/readers', data),
  update: (id, data) => api.put(`/readers/${id}`, data),
  inactivate: (id) => api.patch(`/readers/${id}/inactivate`),
  activate: (id) => api.patch(`/readers/${id}/activate`),
  remove: (id) => api.delete(`/readers/${id}`),
  loanHistory: (id) => api.get(`/readers/${id}/loans`),
};

export const loanService = {
  list: (params) => api.get('/loans', { params }),
  get: (id) => api.get(`/loans/${id}`),
  create: (data) => api.post('/loans', data),
  returnLoan: (id) => api.patch(`/loans/${id}/return`),
  overdue: () => api.get('/loans/overdue'),
  remove: (id) => api.delete(`/loans/${id}`),
};

export const reportService = {
  summary: () => api.get('/reports/summary'),
  popularBooks: (limit = 5) => api.get('/reports/popular-books', { params: { limit } }),
};
