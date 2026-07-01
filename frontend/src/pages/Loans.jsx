import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { loanService, readerService, bookService } from '../api/services';
import { getApiError } from '../api/client';
import {
  Page, Card, DataTable, Pagination, Modal, Button,
  Toolbar, Select, Field,
  Badge, Spinner, EmptyState, Alert,
} from '../components/ui';
import { LOAN_STATUS_LABELS, formatDate } from '../utils/labels';

const bookCell = (loan) =>
  (loan.books || [])
    .map((b) => `${b.title}${b.LoanItem?.quantity > 1 ? ` (x${b.LoanItem.quantity})` : ''}`)
    .join(', ');

export default function Loans() {
  const { hasRole } = useAuth();
  const isStaff = hasRole('admin', 'librarian');
  const isAdmin = hasRole('admin');

  const [loans, setLoans] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [readers, setReaders] = useState([]);
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ readerId: '', bookIds: [], dueDate: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10 };
      if (status) params.status = status;
      const { data } = await loanService.list(params);
      setLoans(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = async () => {
    setForm({ readerId: '', bookIds: [], dueDate: '' });
    setFormError('');
    setModalOpen(true);
    try {
      const [r, b] = await Promise.all([
        readerService.list({ status: 'active', limit: 100 }),
        bookService.list({ available: 'true', limit: 100 }),
      ]);
      setReaders(r.data.data);
      setBooks(b.data.data);
    } catch (err) {
      setFormError(getApiError(err));
    }
  };

  const toggleBook = (id) => {
    setForm((f) => ({
      ...f,
      bookIds: f.bookIds.includes(id) ? f.bookIds.filter((b) => b !== id) : [...f.bookIds, id],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.readerId || form.bookIds.length === 0) {
      setFormError('Selecione um leitor e ao menos um livro.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = { readerId: Number(form.readerId), bookIds: form.bookIds };
      if (form.dueDate) payload.dueDate = form.dueDate;
      await loanService.create(payload);
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = async (loan) => {
    if (!window.confirm(`Confirmar devolução do empréstimo #${loan.id}?`)) return;
    try {
      await loanService.returnLoan(loan.id);
      load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const handleDelete = async (loan) => {
    if (!window.confirm(`Excluir o empréstimo #${loan.id}?`)) return;
    try {
      await loanService.remove(loan.id);
      load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <Page>
      <Page.Header
        title="Empréstimos"
        subtitle={isStaff ? 'Registre e acompanhe os empréstimos.' : 'Seus empréstimos.'}
      >
        {isStaff && (
          <Button variant="primary" onClick={openCreate}>+ Novo empréstimo</Button>
        )}
      </Page.Header>

      <Alert onClose={() => setError('')}>{error}</Alert>

      <Toolbar>
        <Select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">Todos os status</option>
          <option value="open">Em aberto</option>
          <option value="late">Atrasados</option>
          <option value="returned">Devolvidos</option>
        </Select>
      </Toolbar>

      {loading ? (
        <Spinner />
      ) : (
        <Card>
          <DataTable items={loans} rowKey="id" empty={<EmptyState icon="🔁" title="Nenhum empréstimo encontrado" />}>
            <DataTable.Column header="#" field="id" />
            {isStaff && <DataTable.Column header="Leitor" render={(l) => l.reader?.name} />}
            <DataTable.Column header="Livros" render={bookCell} />
            <DataTable.Column header="Empréstimo" render={(l) => formatDate(l.loanDate)} />
            <DataTable.Column header="Devolução prev." render={(l) => formatDate(l.dueDate)} />
            <DataTable.Column header="Devolvido em" render={(l) => formatDate(l.returnDate)} />
            <DataTable.Column header="Status" render={(l) => <Badge kind={l.status}>{LOAN_STATUS_LABELS[l.status]}</Badge>} />
            {isStaff && (
              <DataTable.Column
                header="Ações"
                align="center"
                render={(l) => (
                  <div className="actions">
                    {l.status !== 'returned' && (
                      <Button size="sm" variant="success" onClick={() => handleReturn(l)}>Devolver</Button>
                    )}
                    {isAdmin && l.status === 'returned' && (
                      <Button size="sm" variant="danger" onClick={() => handleDelete(l)}>Excluir</Button>
                    )}
                  </div>
                )}
              />
            )}
          </DataTable>
        </Card>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />

      {modalOpen && (
        <Modal title="Novo empréstimo" onClose={() => setModalOpen(false)} wide>
          <Modal.Body>
            <Alert onClose={() => setFormError('')}>{formError}</Alert>
            <form id="loan-form" onSubmit={handleCreate}>
              <div className="form-grid">
                <Field label="Leitor" required>
                  <Select value={form.readerId} onChange={(e) => setForm({ ...form, readerId: e.target.value })} required>
                    <option value="">Selecione...</option>
                    {readers.map((r) => (
                      <option key={r.id} value={r.id}>{r.name} — {r.document}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Devolução prevista" hint="Se vazio, 14 dias a partir de hoje.">
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </Field>
              </div>

              <Field label={`Livros disponíveis (${form.bookIds.length} selecionado(s))`} required>
                <div className="book-picker">
                  {books.length === 0 ? (
                    <p className="muted">Nenhum livro disponível.</p>
                  ) : (
                    books.map((b) => (
                      <label key={b.id} className={`book-option ${form.bookIds.includes(b.id) ? 'selected' : ''}`}>
                        <input
                          type="checkbox"
                          checked={form.bookIds.includes(b.id)}
                          onChange={() => toggleBook(b.id)}
                        />
                        <span>
                          <strong>{b.title}</strong>
                          <small className="muted"> — {b.author} · {b.availableQuantity} disp.</small>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </Field>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Modal.CancelButton />
            <Button variant="primary" form="loan-form" type="submit" disabled={saving}>
              {saving ? 'Registrando...' : 'Registrar empréstimo'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Page>
  );
}
