// Componentes de feedback (badge, alerta, spinner).

export function Badge({ kind = 'info', children }) {
  return <span className={`badge badge-${kind}`}>{children}</span>;
}

export function Spinner({ label = 'Carregando...' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function Alert({ type = 'error', children, onClose }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type}`}>
      <span>{children}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      )}
    </div>
  );
}
