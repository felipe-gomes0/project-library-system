import Button from './Button';

// Paginação reutilizável. Não renderiza nada quando há só uma página.
export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="pagination">
      <Button size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ‹ Anterior
      </Button>
      <span>
        Página {page} de {totalPages}
      </span>
      <Button size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Próxima ›
      </Button>
    </div>
  );
}
