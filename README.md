# Sistema de Gerenciamento de Biblioteca (Projeto 2 UTFPR)

### Integrantes

* João Vitor Trindade - 2648857
* Felipe do Souza Gomes - 2678292


## Link da apresentação

### https://drive.google.com/file/d/1pDQDa_E0dYwt8VG3-ytjBUo5pPgEkRD0/view?usp=sharing

Monorepo com [backend](backend) (Node.js/Express + Sequelize + PostgreSQL)
e [frontend](frontend) (React + Vite), integrados por um único
`docker-compose.yml` na raiz.

## Como rodar tudo com Docker

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env   # no Windows: copy .env.example .env
```

### 2. Subir banco + API + frontend

> **Importante:** abra o **Docker Desktop** antes deste passo.

```bash
docker compose up --build
```

### 3. Popular o banco (primeira vez)

```bash
docker compose run --rm seed
```

### Acessos

- Frontend: <http://localhost:8080>
- API: <http://localhost:3000/api>
- Swagger: <http://localhost:3000/api-docs>

O frontend é servido em produção pelo pacote `serve` (dentro do container
`web`), e a API libera o acesso via CORS (variável `CORS_ORIGIN`), já que
frontend e backend ficam em portas/origens diferentes no host.

## Credenciais (após o seed)

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Administrador | `admin@biblioteca.com` | `admin123` |
| Bibliotecário | `bibliotecario@biblioteca.com` | `biblio123` |
| Leitor 1 | `joao@aluno.com` | `leitor123` |
| Leitor 2 | `ana@aluno.com` | `leitor123` |

## Desenvolvimento sem Docker

Para rodar backend e frontend localmente com hot-reload (sem containers
de aplicação), veja os READMEs de cada pacote:

- [backend/README.md](backend/README.md)
- [frontend/README.md](frontend/README.md)

O `docker compose up -d db` (a partir da raiz) ainda pode ser usado para
subir só o PostgreSQL nesse cenário.

## Estrutura

```
.
├── docker-compose.yml   # orquestra db + api + web
├── .env.example
├── backend/              # API REST (Express + Sequelize)
└── frontend/             # SPA (React + Vite), servida via `serve` no Docker
```

## Tecnologias obrigatórias

### Backend

* **Node.js / Express** — runtime e framework HTTP que expõe a API REST
  (rotas, middlewares, tratamento de erros).
* **Sequelize** — ORM usado para modelar as entidades (`User`, `Reader`,
  `Book`, `Loan`, `LoanItem`) e falar com o PostgreSQL sem escrever SQL cru
  (migrations/sync, associações, validações de modelo).
* **PostgreSQL** — banco relacional que persiste os dados da aplicação
  (rodando em container próprio no `docker-compose.yml`).
* **JWT (jsonwebtoken)** — gera e valida o token de autenticação; o
  middleware [auth.js](backend/src/middlewares/auth.js) o usa para proteger
  rotas e identificar o usuário logado em cada requisição.
* **Swagger (swagger-jsdoc + swagger-ui-express)** — gera a documentação
  interativa da API a partir de comentários nas rotas, disponível em
  `/api-docs`.

Outras libs de apoio no backend: `bcryptjs` (hash de senha),
`express-validator` (validação de payloads), `cors` (libera o frontend a
consumir a API de outra origem) e `morgan` (log de requisições HTTP).

### Frontend

* **React** — biblioteca de UI usada para montar as telas (login, livros,
  leitores, empréstimos) como componentes.
* **React Router DOM** — controla a navegação entre as telas e as rotas
  protegidas (guards de autenticação).
* **Axios** — cliente HTTP que consome a API do backend (interceptors para
  anexar o JWT e tratar erros de resposta).
* **Vite** — bundler/dev server do frontend (build rápido e hot-reload em
  desenvolvimento).
