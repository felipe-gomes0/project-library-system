# Biblioteca — Frontend React (Projeto 2 UTFPR)

Interface web em **React + Vite** que consome a API do Sistema de Gerenciamento de Biblioteca.

## Tecnologias

- React 18 + Vite
- React Router (rotas e proteção por perfil)
- Axios (com interceptors para o token JWT)
- Context API (autenticação)

## Funcionalidades

- **Login** com JWT (token salvo no `localStorage`).
- **Dashboard** com indicadores (staff) ou "meus empréstimos" (leitor).
- **Livros**: listagem, busca/filtros, cadastro, edição e exclusão.
- **Leitores**: listagem, busca, cadastro, edição, ativar/inativar, histórico.
- **Empréstimos**: registrar (1+ livros), devolver, filtrar por status.
- **Usuários** (admin): CRUD de usuários do sistema.
- Menu e ações **adaptados ao perfil** (admin / bibliotecário / leitor).

## Padrão de composição (composition pattern)

A UI é montada **compondo componentes pequenos e reutilizáveis** (em `src/components/ui/`), em vez de componentes grandes configurados por muitas props:

- **Compound components** (com `children` e Context):
  - `Card` → `Card.Header`, `Card.Title`, `Card.Body`
  - `Modal` → `Modal.Body`, `Modal.Footer`, `Modal.CancelButton` (compartilham `onClose` via Context)
  - `DataTable` → `DataTable.Column` (colunas **declaradas como filhos**; a tabela lê essas definições para montar cabeçalho e células)
  - `Page` → `Page.Header` (título + *slot* de ações por `children`)
- **Slots via `children`**: `Toolbar`, `Field` (rótulo + controle), `PageHeader` (ações).
- **Primitivos**: `Button`, `Badge`, `Alert`, `Spinner`, `EmptyState`, `Pagination`, `StatCard`, `SearchInput`, `Select`, `FormGrid`.

Exemplo (tabela declarativa por composição):

```jsx
<DataTable items={books} rowKey="id" empty={<EmptyState title="Nada aqui" />}>
  <DataTable.Column header="Título" render={(b) => <strong>{b.title}</strong>} />
  <DataTable.Column header="Autor" field="author" />
  <DataTable.Column header="Ações" align="center" render={(b) => <Button>Editar</Button>} />
</DataTable>
```

Todas as páginas (`Books`, `Readers`, `Loans`, `Users`, `Dashboard`) são montadas a partir desses blocos.

> Para rodar o **projeto inteiro** (banco + API + frontend) com Docker,
> use o `docker-compose.yml` na raiz do repositório — veja o
> [README raiz](../README.md). As instruções abaixo são para rodar
> **apenas o frontend** localmente (fora do Docker).

## Pré-requisitos

- Node.js 18+
- A **API backend rodando** em `http://localhost:3000` (ver [../backend](../backend)).

## Como rodar

```bash
npm install
npm run dev
```

Abre em <http://localhost:5173>.

A URL da API é configurável em `.env`:

```
VITE_API_URL=http://localhost:3000/api
```

## Credenciais (após o seed do backend)

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Administrador | `admin@biblioteca.com` | `admin123` |
| Bibliotecário | `bibliotecario@biblioteca.com` | `biblio123` |
| Leitor | `joao@aluno.com` | `leitor123` |

> Na tela de login há botões de **acesso rápido** para cada perfil (demonstração).

## Build de produção

```bash
npm run build
npm run preview
```
