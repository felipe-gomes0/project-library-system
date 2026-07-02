import { useEffect, useState, useCallback } from 'react';
import { BookOpenIcon } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { bookService } from '../api/services';
import { getApiError } from '../api/client';
import {
  Page, Card, DataTable, Pagination, Modal, Button,
  Toolbar, SearchInput, Select, Field, FormGrid,
  Badge, Spinner, EmptyState, Alert,
} from '../components/ui';
import { BOOK_STATUS_LABELS } from '../utils/labels';

const emptyBook = {
  title: '', author: '', publisher: '', publicationYear: '',
  category: '', isbn: '', totalQuantity: 1, availableQuantity: 1,
};

export default function Books() {
  const { hasRole } = useAuth();
  const canWrite = hasRole('admin', 'librarian');
  const canDelete = hasRole('admin');

  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [q, setQ] = useState('');
  const [available, setAvailable] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBook);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 8 };
      if (q) params.q = q;
      if (available) params.available = available;
      const { data } = await bookService.list(params);
      setBooks(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [q, available, page]);

  useEffect(() => {
    const t = setTimeout(load, 300); // debounce simples na busca
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyBook);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (book) => {
    setEditing(book);
    setForm({
      title: book.title || '',
      author: book.author || '',
      publisher: book.publisher || '',
      publicationYear: book.publicationYear || '',
      category: book.category || '',
      isbn: book.isbn || '',
      totalQuantity: book.totalQuantity,
      availableQuantity: book.availableQuantity,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        publicationYear: form.publicationYear ? Number(form.publicationYear) : null,
        totalQuantity: Number(form.totalQuantity),
        availableQuantity: Number(form.availableQuantity),
      };
      if (editing) await bookService.update(editing.id, payload);
      else await bookService.create(payload);
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Excluir o livro "${book.title}"?`)) return;
    try {
      await bookService.remove(book.id);
      load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <Page>
      <Page.Header title="Livros" subtitle="Acervo da biblioteca.">
        {canWrite && (
          <Button variant="primary" onClick={openCreate}>
            + Novo livro
          </Button>
        )}
      </Page.Header>

      <Alert onClose={() => setError('')}>{error}</Alert>

      <Toolbar>
        <SearchInput
          placeholder="Buscar por título, autor, categoria ou ISBN..."
          value={q}
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
        />
        <Select value={available} onChange={(e) => { setPage(1); setAvailable(e.target.value); }}>
          <option value="">Todos</option>
          <option value="true">Somente disponíveis</option>
          <option value="false">Somente indisponíveis</option>
        </Select>
      </Toolbar>

      {loading ? (
        <Spinner />
      ) : (
        <Card>
          <DataTable
            items={books}
            rowKey="id"
            empty={<EmptyState icon={<BookOpenIcon />} title="Nenhum livro encontrado" message="Tente ajustar a busca ou cadastre um novo livro." />}
          >
            <DataTable.Column
              header="Título"
              render={(b) => (
                <>
                  <strong>{b.title}</strong>
                  <br />
                  <small className="muted">{b.publisher} {b.publicationYear ? `· ${b.publicationYear}` : ''}</small>
                </>
              )}
            />
            <DataTable.Column header="Autor" field="author" />
            <DataTable.Column header="Categoria" render={(b) => b.category || '—'} />
            <DataTable.Column header="ISBN" field="isbn" />
            <DataTable.Column header="Disp. / Total" align="center" render={(b) => `${b.availableQuantity} / ${b.totalQuantity}`} />
            <DataTable.Column
              header="Status"
              render={(b) => (
                <Badge kind={b.status === 'available' ? 'open' : 'late'}>{BOOK_STATUS_LABELS[b.status]}</Badge>
              )}
            />
            {canWrite && (
              <DataTable.Column
                header="Ações"
                align="center"
                render={(b) => (
                  <div className="actions">
                    <Button size="sm" onClick={() => openEdit(b)}>Editar</Button>
                    {canDelete && (
                      <Button size="sm" variant="danger" onClick={() => handleDelete(b)}>Excluir</Button>
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
        <Modal title={editing ? 'Editar livro' : 'Novo livro'} onClose={() => setModalOpen(false)} wide>
          <Modal.Body>
            <Alert onClose={() => setFormError('')}>{formError}</Alert>
            <FormGrid id="book-form" onSubmit={handleSave}>
              <Field label="Título" required span2>
                <input value={form.title} onChange={set('title')} required />
              </Field>
              <Field label="Autor" required>
                <input value={form.author} onChange={set('author')} required />
              </Field>
              <Field label="Editora">
                <input value={form.publisher} onChange={set('publisher')} />
              </Field>
              <Field label="Ano">
                <input type="number" value={form.publicationYear} onChange={set('publicationYear')} />
              </Field>
              <Field label="Categoria">
                <input value={form.category} onChange={set('category')} />
              </Field>
              <Field label="ISBN" required span2>
                <input value={form.isbn} onChange={set('isbn')} required />
              </Field>
              <Field label="Quantidade total">
                <input type="number" min="0" value={form.totalQuantity} onChange={set('totalQuantity')} />
              </Field>
              <Field label="Quantidade disponível">
                <input type="number" min="0" value={form.availableQuantity} onChange={set('availableQuantity')} />
              </Field>
            </FormGrid>
          </Modal.Body>
          <Modal.Footer>
            <Modal.CancelButton />
            <Button variant="primary" form="book-form" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Page>
  );
}
