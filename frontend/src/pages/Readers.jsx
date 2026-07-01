import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { readerService } from '../api/services';
import { getApiError } from '../api/client';
import {
  Page, Card, DataTable, Pagination, Modal, Button,
  Toolbar, SearchInput, Select, Field, FormGrid,
  Badge, Spinner, EmptyState, Alert,
} from '../components/ui';
import { READER_STATUS_LABELS, LOAN_STATUS_LABELS, formatDate } from '../utils/labels';

const emptyReader = { name: '', document: '', email: '', phone: '', address: '', status: 'active' };

export default function Readers() {
  const { hasRole } = useAuth();
  const canDelete = hasRole('admin');

  const [readers, setReaders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyReader);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [historyReader, setHistoryReader] = useState(null);
  const [history, setHistory] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 8 };
      if (q) params.q = q;
      if (status) params.status = status;
      const { data } = await readerService.list(params);
      setReaders(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [q, status, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyReader);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (reader) => {
    setEditing(reader);
    setForm({
      name: reader.name || '',
      document: reader.document || '',
      email: reader.email || '',
      phone: reader.phone || '',
      address: reader.address || '',
      status: reader.status,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editing) await readerService.update(editing.id, form);
      else await readerService.create(form);
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (reader) => {
    try {
      if (reader.status === 'active') await readerService.inactivate(reader.id);
      else await readerService.activate(reader.id);
      load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const handleDelete = async (reader) => {
    if (!window.confirm(`Excluir o leitor "${reader.name}"?`)) return;
    try {
      await readerService.remove(reader.id);
      load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const openHistory = async (reader) => {
    setHistoryReader(reader);
    setHistory([]);
    try {
      const { data } = await readerService.loanHistory(reader.id);
      setHistory(data.data);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <Page>
      <Page.Header title="Leitores" subtitle="Cadastro e consulta de leitores.">
        <Button variant="primary" onClick={openCreate}>+ Novo leitor</Button>
      </Page.Header>

      <Alert onClose={() => setError('')}>{error}</Alert>

      <Toolbar>
        <SearchInput
          placeholder="🔎 Buscar por nome, CPF/RA ou e-mail..."
          value={q}
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
        />
        <Select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </Select>
      </Toolbar>

      {loading ? (
        <Spinner />
      ) : (
        <Card>
          <DataTable items={readers} rowKey="id" empty={<EmptyState icon="👥" title="Nenhum leitor encontrado" />}>
            <DataTable.Column header="Nome" render={(r) => <strong>{r.name}</strong>} />
            <DataTable.Column header="CPF/RA" field="document" />
            <DataTable.Column header="E-mail" field="email" />
            <DataTable.Column header="Telefone" render={(r) => r.phone || '—'} />
            <DataTable.Column
              header="Status"
              render={(r) => <Badge kind={r.status === 'active' ? 'open' : 'late'}>{READER_STATUS_LABELS[r.status]}</Badge>}
            />
            <DataTable.Column
              header="Ações"
              align="center"
              render={(r) => (
                <div className="actions">
                  <Button size="sm" onClick={() => openHistory(r)}>Histórico</Button>
                  <Button size="sm" onClick={() => openEdit(r)}>Editar</Button>
                  <Button size="sm" onClick={() => toggleStatus(r)}>
                    {r.status === 'active' ? 'Inativar' : 'Ativar'}
                  </Button>
                  {canDelete && (
                    <Button size="sm" variant="danger" onClick={() => handleDelete(r)}>Excluir</Button>
                  )}
                </div>
              )}
            />
          </DataTable>
        </Card>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />

      {modalOpen && (
        <Modal title={editing ? 'Editar leitor' : 'Novo leitor'} onClose={() => setModalOpen(false)} wide>
          <Modal.Body>
            <Alert onClose={() => setFormError('')}>{formError}</Alert>
            <FormGrid id="reader-form" onSubmit={handleSave}>
              <Field label="Nome" required span2>
                <input value={form.name} onChange={set('name')} required />
              </Field>
              <Field label="CPF/RA" required>
                <input value={form.document} onChange={set('document')} required />
              </Field>
              <Field label="E-mail" required>
                <input type="email" value={form.email} onChange={set('email')} required />
              </Field>
              <Field label="Telefone">
                <input value={form.phone} onChange={set('phone')} />
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={set('status')}>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </Select>
              </Field>
              <Field label="Endereço" span2>
                <input value={form.address} onChange={set('address')} />
              </Field>
            </FormGrid>
          </Modal.Body>
          <Modal.Footer>
            <Modal.CancelButton />
            <Button variant="primary" form="reader-form" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {historyReader && (
        <Modal title={`Histórico — ${historyReader.name}`} onClose={() => setHistoryReader(null)} wide>
          <Modal.Body>
            <DataTable items={history} rowKey="id" empty={<p className="muted">Nenhum empréstimo registrado.</p>}>
              <DataTable.Column header="#" field="id" />
              <DataTable.Column header="Livros" render={(l) => (l.books || []).map((b) => b.title).join(', ')} />
              <DataTable.Column header="Empréstimo" render={(l) => formatDate(l.loanDate)} />
              <DataTable.Column header="Devolução prev." render={(l) => formatDate(l.dueDate)} />
              <DataTable.Column header="Status" render={(l) => <Badge kind={l.status}>{LOAN_STATUS_LABELS[l.status]}</Badge>} />
            </DataTable>
          </Modal.Body>
        </Modal>
      )}
    </Page>
  );
}
