export const ROLE_LABELS = {
  admin: 'Administrador',
  librarian: 'Bibliotecário',
  reader: 'Leitor',
};

export const BOOK_STATUS_LABELS = {
  available: 'Disponível',
  unavailable: 'Indisponível',
};

export const READER_STATUS_LABELS = {
  active: 'Ativo',
  inactive: 'Inativo',
};

export const LOAN_STATUS_LABELS = {
  open: 'Em aberto',
  returned: 'Devolvido',
  late: 'Atrasado',
};

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, day] = value.split('-');
    return `${day}/${m}/${y}`;
  }
  return d.toLocaleDateString('pt-BR');
}
