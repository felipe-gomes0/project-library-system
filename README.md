# Sistema de Gerenciamento de Biblioteca (Projeto 2 UTFPR)

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

O Nginx do frontend faz proxy de `/api` para o container da API, então o
frontend e a API ficam na mesma origem (sem problemas de CORS) mesmo
usando portas diferentes no host.

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
└── frontend/             # SPA (React + Vite), servida via Nginx no Docker
```
