# Sistema de Gerenciamento de Biblioteca — Backend (Projeto 2 UTFPR)

API REST para gerenciamento de uma biblioteca, com **Node.js + Express**, **Sequelize + PostgreSQL**, autenticação **JWT**, controle de acesso por perfil e documentação **Swagger**.

## Tecnologias

- Node.js / Express
- Sequelize (ORM) + PostgreSQL
- JWT (`jsonwebtoken`) + `bcryptjs`
- `express-validator` (validação)
- Swagger (`swagger-ui-express` + `swagger-jsdoc`)
- Docker / Docker Compose

## Perfis de usuário

| Perfil | Acesso |
|--------|--------|
| **admin** | Acesso total: usuários, livros, leitores, empréstimos, relatórios |
| **librarian** (bibliotecário) | Livros, leitores e empréstimos (não gerencia usuários do sistema) |
| **reader** (leitor) | Consulta de livros disponíveis e dos **próprios** empréstimos |

> Para rodar o **projeto inteiro** (banco + API + frontend) com Docker,
> use o `docker-compose.yml` na raiz do repositório — veja o
> [README raiz](../README.md). As instruções abaixo são para rodar
> **apenas o backend** localmente (fora do Docker).

## Pré-requisitos

- [Node.js 18+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para o PostgreSQL)

## Como rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env   # no Windows: copy .env.example .env
```

As credenciais padrão já funcionam com o `docker-compose.yml` da raiz.

### 3. Subir o banco PostgreSQL

> **Importante:** abra o **Docker Desktop** antes deste passo.

```bash
docker compose -f ../docker-compose.yml up -d db
```

### 4. Criar as tabelas e popular dados iniciais (seed)

```bash
npm run seed
```

Isso cria as tabelas e os usuários obrigatórios (1 admin, 1 bibliotecário, 2 leitores) + livros de exemplo.

### 5. Iniciar a API

```bash
npm run dev     # com reload automático (nodemon)
# ou
npm start
```

- API: <http://localhost:3000/api>
- Swagger: <http://localhost:3000/api-docs>
- Healthcheck: <http://localhost:3000/api/health>

## Credenciais (após o seed)

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Administrador | `admin@biblioteca.com` | `admin123` |
| Bibliotecário | `bibliotecario@biblioteca.com` | `biblio123` |
| Leitor 1 | `joao@aluno.com` | `leitor123` |
| Leitor 2 | `ana@aluno.com` | `leitor123` |

## Autenticação

1. `POST /api/auth/login` com e-mail e senha → retorna `token`.
2. Envie o token nas demais requisições no header:
   `Authorization: Bearer <token>`
3. No Swagger, clique em **Authorize** e cole o token.

## Principais rotas

| Recurso | Método | Rota | Perfis |
|---------|--------|------|--------|
| Auth | POST | `/api/auth/login` | público |
| Auth | POST | `/api/auth/register` | admin |
| Usuários | GET/POST/PUT/DELETE | `/api/users` | admin |
| Livros | GET | `/api/books` | todos |
| Livros | POST/PUT | `/api/books` | admin, bibliotecário |
| Livros | DELETE | `/api/books/:id` | admin |
| Leitores | GET/POST/PUT | `/api/readers` | admin, bibliotecário |
| Leitores | DELETE | `/api/readers/:id` | admin |
| Empréstimos | GET | `/api/loans` | todos (leitor vê só os seus) |
| Empréstimos | POST | `/api/loans` | admin, bibliotecário |
| Empréstimos | PATCH | `/api/loans/:id/return` | admin, bibliotecário |
| Empréstimos | GET | `/api/loans/overdue` | admin, bibliotecário |
| Relatórios | GET | `/api/reports/summary` | admin, bibliotecário |

### Busca e filtros

- Livros: `?q=`, `?title=`, `?author=`, `?category=`, `?isbn=`, `?available=true`
- Leitores: `?q=`, `?name=`, `?document=`, `?status=`
- Empréstimos: `?status=`, `?readerId=`, `?from=`, `?to=`
- Paginação em todas as listagens: `?page=1&limit=10`

## Regras de negócio

- Um livro só é emprestado se houver `availableQuantity > 0`.
- Ao emprestar, a quantidade disponível **diminui** (em transação).
- Ao devolver, a quantidade disponível **aumenta**.
- Leitor **inativo** não pode pegar empréstimo.
- Empréstimos vencidos passam automaticamente para o status **atrasado**.
- Leitor só visualiza os próprios empréstimos.

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia com nodemon |
| `npm start` | Inicia a API |
| `npm run seed` | Cria tabelas e popula dados iniciais |
| `npm run db:reset` | **Recria** as tabelas (apaga dados) e popula |

## Rodar o projeto inteiro via Docker (recomendado)

Use o `docker-compose.yml` na raiz do repositório, que sobe banco, API e
frontend já integrados:

```bash
cd ..
docker compose up --build
docker compose run --rm seed   # popula o banco na primeira vez
```

Veja detalhes no [README raiz](../README.md).

## Variável `DB_SYNC`

- `alter` (padrão dev): ajusta as tabelas conforme os models.
- `force`: **dropa** e recria todas as tabelas (apaga dados).
- `none`: não altera o schema.
