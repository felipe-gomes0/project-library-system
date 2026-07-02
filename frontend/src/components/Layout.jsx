import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  BooksIcon, HouseIcon, BookOpenIcon, UsersIcon, ArrowsClockwiseIcon, LockKeyIcon,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/labels';
import { Button } from './ui';

export default function Layout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon"><BooksIcon weight="fill" /></span>
          <div>
            <strong>Biblioteca</strong>
            <small>Projeto 2 — UTFPR</small>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end className="nav-link">
            <HouseIcon size={18} /> Início
          </NavLink>
          <NavLink to="/books" className="nav-link">
            <BookOpenIcon size={18} /> Livros
          </NavLink>

          {hasRole('admin', 'librarian') && (
            <>
              <NavLink to="/readers" className="nav-link">
                <UsersIcon size={18} /> Leitores
              </NavLink>
            </>
          )}

          <NavLink to="/loans" className="nav-link">
            <ArrowsClockwiseIcon size={18} /> Empréstimos
          </NavLink>

          {hasRole('admin') && (
            <NavLink to="/users" className="nav-link">
              <LockKeyIcon size={18} /> Usuários
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar">{(user?.name || '?').charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <strong>{user?.name}</strong>
              <small>{ROLE_LABELS[user?.role] || user?.role}</small>
            </div>
          </div>
          <Button variant="ghost" block onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
