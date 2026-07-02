import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { BooksIcon } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../api/client';
import { Button, Field, Alert } from '../components/ui';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@biblioteca.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(getApiError(err, 'Não foi possível fazer login.'));
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (e, p) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-icon"><BooksIcon weight="fill" /></span>
          <h1>Biblioteca</h1>
          <p>Sistema de Gerenciamento — Projeto 2 UTFPR</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <Alert onClose={() => setError('')}>{error}</Alert>

          <Field label="E-mail">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </Field>

          <Field label="Senha">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </Field>

          <Button type="submit" variant="primary" block disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="login-hint">
          <p>Acesso rápido (demonstração):</p>
          <div className="login-chips">
            <button onClick={() => quickFill('admin@biblioteca.com', 'admin123')}>Admin</button>
            <button onClick={() => quickFill('bibliotecario@biblioteca.com', 'biblio123')}>
              Bibliotecário
            </button>
            <button onClick={() => quickFill('joao@aluno.com', 'leitor123')}>Leitor</button>
          </div>
        </div>
      </div>
    </div>
  );
}
