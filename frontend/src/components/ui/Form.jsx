import { MagnifyingGlassIcon } from '@phosphor-icons/react';

// Primitivos de formulário e barra de ferramentas, pensados para composição.

// Toolbar: apenas um container; os controles (busca, selects) entram por children.
export function Toolbar({ children }) {
  return <div className="toolbar">{children}</div>;
}

// Campo de busca padronizado, com ícone de lupa embutido.
export function SearchInput(props) {
  return (
    <div className="search-wrap">
      <MagnifyingGlassIcon className="search-icon" />
      <input className="search" type="search" {...props} />
    </div>
  );
}

// Select padronizado: as <option> são compostas por children.
export function Select({ children, ...props }) {
  return <select {...props}>{children}</select>;
}

// Field: compõe rótulo + controle. O controle (input/select/textarea) vem por children.
// Uso:
//   <Field label="Título" required span2>
//     <input value={...} onChange={...} />
//   </Field>
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

// Grid de formulário: organiza Fields em duas colunas.
export function FormGrid({ id, onSubmit, children }) {
  return (
    <form id={id} onSubmit={onSubmit} className="form-grid">
      {children}
    </form>
  );
}
