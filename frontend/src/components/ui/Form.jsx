export function Toolbar({ children }) {
  return <div className="toolbar">{children}</div>;
}

export function SearchInput(props) {
  return <input className="search" type="search" {...props} />;
}

export function Select({ children, ...props }) {
  return <select {...props}>{children}</select>;
}

export function Field({ label, required = false, span2 = false, hint, className = '', children }) {
  return (
    <label className={`field ${span2 ? 'span-2' : ''} ${className}`}>
      {label && (
        <span>
          {label}
          {required && ' *'}
        </span>
      )}
      {children}
      {hint && <small className="muted">{hint}</small>}
    </label>
  );
}

export function FormGrid({ id, onSubmit, children }) {
  return (
    <form id={id} onSubmit={onSubmit} className="form-grid">
      {children}
    </form>
  );
}
