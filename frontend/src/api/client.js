import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Anexa o token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Em caso de 401 (token expirado/inválido), limpa a sessão e volta ao login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const onLogin = window.location.pathname === '/login';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!onLogin) window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Extrai a mensagem de erro amigável vinda da API
export function getApiError(error, fallback = 'Ocorreu um erro inesperado.') {
  const data = error?.response?.data;
  if (data?.details?.length) {
    return data.details.map((d) => d.message).join(' • ');
  }
  return data?.message || error?.message || fallback;
}

export default api;
