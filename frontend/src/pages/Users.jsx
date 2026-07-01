import { useEffect, useState, useCallback } from 'react';
import { userService } from '../api/services';
import { getApiError } from '../api/client';
import {
  Page, Card, DataTable, Pagination, Modal, Button,
  Toolbar, SearchInput, Select, Field, FormGrid,
  Badge, Spinner, EmptyState, Alert,
} from '../components/ui';
import { ROLE_LABELS } from '../utils/labels';

const emptyUser = { name: '', email: '', password: '', role: 'reader', active: true };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 8 };
      if (q) params.q = q;
      if (role) params.role = role;
      const { data } = await userService.list(params);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [q, role, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyUser);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role, active: user.active });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form };
      if (editing && !payload.password) delete payload.password; // não altera senha se vazio
      if (editing) await userService.update(editing.id, payload);
      else await userService.create(payload);
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Excluir o usuário "${user.name}"?`)) return;
    try {
      await userService.remove(user.id);
      load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <Page>
      <Page.Header title="Usuários do sistema" subtitle="Gerencie administradores, bibliotecários e leitores.">
        <Button variant="primary" onClick={openCreate}>+ Novo usuário</Button>
      </Page.Header>

      <Alert onClose={() => setError('')}>{error}</Alert>

      <Toolbar>
        <SearchInput
          placeholder="🔎 Buscar por nome ou e-mail..."
          value={q}
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
        />
        <Select value={role} onChange={(e) => { setPage(1); setRole(e.target.value); }}>
          <option value="">Todos os perfis</option>
          <option value="admin">Administrador</option>
          <option value="librarian">Bibliotecário</option>
          <option value="reader">Leitor</option>
        </Select>
      </Toolbar>

      {loading ? (
        <Spinner />
      ) : (
        <Card>
          <DataTable items={users} rowKey="id" empty={<EmptyState icon="🔐" title="Nenhum usuário encontrado" />}>
            <DataTable.Column header="Nome" render={(u) => <strong>{u.name}</strong>} />
            <DataTable.Column header="E-mail" field="email" />
            <DataTable.Column header="Perfil" render={(u) => <Badge kind="info">{ROLE_LABELS[u.role]}</Badge>} />
            <DataTable.Column header="Situação" render={(u) => <Badge kind={u.active ? 'open' : 'late'}>{u.active ? 'Ativo' : 'Inativo'}</Badge>} />
            <DataTable.Column
              header="Ações"
              align="center"
              render={(u) => (
                <div className="actions">
                  <Button size="sm" onClick={() => openEdit(u)}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(u)}>Excluir</Button>
                </div>
              )}
            />
          </DataTable>
        </Card>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />

      {modalOpen && (
        <Modal title={editing ? 'Editar usuário' : 'Novo usuário'} onClose={() => setModalOpen(false)}>
          <Modal.Body>
            <Alert onClose={() => setFormError('')}>{formError}</Alert>
            <FormGrid id="user-form" onSubmit={handleSave}>
              <Field label="Nome" required span2>
                <input value={form.name} onChange={set('name')} required />
              </Field>
              <Field label="E-mail" required span2>
                <input type="email" value={form.email} onChange={set('email')} required />
              </Field>
              <Field label={editing ? 'Nova senha (opcional)' : 'Senha'} required={!editing}>
                <input
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  required={!editing}
                  placeholder={editing ? 'Deixe em branco p/ manter' : ''}
                />
              </Field>
              <Field label="Perfil" required>
                <Select value={form.role} onChange={set('role')}>
                  <option value="admin">Administrador</option>
                  <option value="librarian">Bibliotecário</option>
                  <option value="reader">Leitor</option>
                </Select>
              </Field>
              {editing && (
                <Field span2 className="checkbox-field">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  <span>Usuário ativo</span>
                </Field>
              )}
            </FormGrid>
          </Modal.Body>
          <Modal.Footer>
            <Modal.CancelButton />
            <Button variant="primary" form="user-form" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Page>
  );
}
