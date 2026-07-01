const swaggerJSDoc = require('swagger-jsdoc');
const env = require('./env');

// Componentes reutilizáveis
const schemas = {
  Error: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'error' },
      message: { type: 'string', example: 'Mensagem de erro' },
      details: { type: 'array', items: { type: 'object' } },
    },
  },
  LoginInput: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', example: 'admin@biblioteca.com' },
      password: { type: 'string', example: 'admin123' },
    },
  },
  User: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      name: { type: 'string', example: 'Administrador' },
      email: { type: 'string', example: 'admin@biblioteca.com' },
      role: { type: 'string', enum: ['admin', 'librarian', 'reader'], example: 'admin' },
      active: { type: 'boolean', example: true },
    },
  },
  UserInput: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: { type: 'string', example: 'Maria Bibliotecária' },
      email: { type: 'string', example: 'maria@biblioteca.com' },
      password: { type: 'string', example: 'senha123' },
      role: { type: 'string', enum: ['admin', 'librarian', 'reader'], example: 'librarian' },
    },
  },
  Book: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      title: { type: 'string', example: 'Dom Casmurro' },
      author: { type: 'string', example: 'Machado de Assis' },
      publisher: { type: 'string', example: 'Editora Brasil' },
      publicationYear: { type: 'integer', example: 1899 },
      category: { type: 'string', example: 'Romance' },
      isbn: { type: 'string', example: '978-85-359-0277-2' },
      totalQuantity: { type: 'integer', example: 5 },
      availableQuantity: { type: 'integer', example: 5 },
      status: { type: 'string', enum: ['available', 'unavailable'], example: 'available' },
      coverUrl: { type: 'string', example: 'https://exemplo.com/capa.jpg' },
    },
  },
  BookInput: {
    type: 'object',
    required: ['title', 'author', 'isbn'],
    properties: {
      title: { type: 'string', example: 'Dom Casmurro' },
      author: { type: 'string', example: 'Machado de Assis' },
      publisher: { type: 'string', example: 'Editora Brasil' },
      publicationYear: { type: 'integer', example: 1899 },
      category: { type: 'string', example: 'Romance' },
      isbn: { type: 'string', example: '978-85-359-0277-2' },
      totalQuantity: { type: 'integer', example: 5 },
      availableQuantity: { type: 'integer', example: 5 },
    },
  },
  Reader: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      name: { type: 'string', example: 'João da Silva' },
      document: { type: 'string', example: '123.456.789-00' },
      email: { type: 'string', example: 'joao@aluno.com' },
      phone: { type: 'string', example: '(41) 99999-0000' },
      address: { type: 'string', example: 'Rua das Flores, 100' },
      status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
    },
  },
  ReaderInput: {
    type: 'object',
    required: ['name', 'document', 'email'],
    properties: {
      name: { type: 'string', example: 'João da Silva' },
      document: { type: 'string', example: '123.456.789-00' },
      email: { type: 'string', example: 'joao@aluno.com' },
      phone: { type: 'string', example: '(41) 99999-0000' },
      address: { type: 'string', example: 'Rua das Flores, 100' },
      status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
    },
  },
  Loan: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      reader_id: { type: 'integer', example: 1 },
      loanDate: { type: 'string', format: 'date', example: '2026-06-30' },
      dueDate: { type: 'string', format: 'date', example: '2026-07-14' },
      returnDate: { type: 'string', format: 'date', nullable: true, example: null },
      status: { type: 'string', enum: ['open', 'returned', 'late'], example: 'open' },
    },
  },
  LoanInput: {
    type: 'object',
    required: ['readerId'],
    properties: {
      readerId: { type: 'integer', example: 1 },
      bookIds: { type: 'array', items: { type: 'integer' }, example: [1, 2] },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            bookId: { type: 'integer', example: 1 },
            quantity: { type: 'integer', example: 1 },
          },
        },
      },
      loanDate: { type: 'string', format: 'date', example: '2026-06-30' },
      dueDate: { type: 'string', format: 'date', example: '2026-07-14' },
    },
  },
};

// Helpers para descrever respostas comuns
const ok = (ref) => ({
  200: {
    description: 'Sucesso',
    content: { 'application/json': { schema: ref } },
  },
});
const created = (ref) => ({
  201: { description: 'Criado', content: { 'application/json': { schema: ref } } },
});
const errResp = (code, desc) => ({
  [code]: { description: desc, content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
});

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'integer' },
};

const paths = {
  '/auth/login': {
    post: {
      tags: ['Autenticação'],
      summary: 'Login e geração de token JWT',
      security: [],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } },
      },
      responses: { ...ok({ type: 'object' }), ...errResp(401, 'Credenciais inválidas') },
    },
  },
  '/auth/register': {
    post: {
      tags: ['Autenticação'],
      summary: 'Cadastrar usuário do sistema (somente admin)',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UserInput' } } },
      },
      responses: { ...created({ $ref: '#/components/schemas/User' }), ...errResp(403, 'Sem permissão') },
    },
  },
  '/auth/me': {
    get: {
      tags: ['Autenticação'],
      summary: 'Dados do usuário autenticado',
      responses: { ...ok({ $ref: '#/components/schemas/User' }), ...errResp(401, 'Não autenticado') },
    },
  },

  '/users': {
    get: {
      tags: ['Usuários'],
      summary: 'Listar usuários (admin)',
      parameters: [
        { name: 'role', in: 'query', schema: { type: 'string' } },
        { name: 'q', in: 'query', schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: ok({ type: 'object' }),
    },
    post: {
      tags: ['Usuários'],
      summary: 'Criar usuário (admin)',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UserInput' } } } },
      responses: created({ $ref: '#/components/schemas/User' }),
    },
  },
  '/users/{id}': {
    get: { tags: ['Usuários'], summary: 'Obter usuário', parameters: [idParam], responses: ok({ $ref: '#/components/schemas/User' }) },
    put: {
      tags: ['Usuários'], summary: 'Atualizar usuário', parameters: [idParam],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UserInput' } } } },
      responses: ok({ $ref: '#/components/schemas/User' }),
    },
    delete: { tags: ['Usuários'], summary: 'Excluir usuário', parameters: [idParam], responses: { ...ok({ type: 'object' }), ...errResp(409, 'Conflito') } },
  },

  '/books': {
    get: {
      tags: ['Livros'],
      summary: 'Listar/buscar livros',
      parameters: [
        { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Busca geral (título, autor, categoria, ISBN)' },
        { name: 'title', in: 'query', schema: { type: 'string' } },
        { name: 'author', in: 'query', schema: { type: 'string' } },
        { name: 'category', in: 'query', schema: { type: 'string' } },
        { name: 'isbn', in: 'query', schema: { type: 'string' } },
        { name: 'available', in: 'query', schema: { type: 'boolean' }, description: 'Filtra por disponibilidade' },
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: ok({ type: 'object' }),
    },
    post: {
      tags: ['Livros'], summary: 'Cadastrar livro (admin/bibliotecário)',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BookInput' } } } },
      responses: created({ $ref: '#/components/schemas/Book' }),
    },
  },
  '/books/categories': {
    get: { tags: ['Livros'], summary: 'Listar categorias distintas', responses: ok({ type: 'object' }) },
  },
  '/books/{id}': {
    get: { tags: ['Livros'], summary: 'Obter livro', parameters: [idParam], responses: { ...ok({ $ref: '#/components/schemas/Book' }), ...errResp(404, 'Não encontrado') } },
    put: {
      tags: ['Livros'], summary: 'Atualizar livro (admin/bibliotecário)', parameters: [idParam],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/BookInput' } } } },
      responses: ok({ $ref: '#/components/schemas/Book' }),
    },
    delete: { tags: ['Livros'], summary: 'Excluir livro (admin)', parameters: [idParam], responses: { ...ok({ type: 'object' }), ...errResp(409, 'Possui exemplares emprestados') } },
  },

  '/readers': {
    get: {
      tags: ['Leitores'], summary: 'Listar/buscar leitores (admin/bibliotecário)',
      parameters: [
        { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Busca por nome, CPF/RA ou e-mail' },
        { name: 'name', in: 'query', schema: { type: 'string' } },
        { name: 'document', in: 'query', schema: { type: 'string' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive'] } },
      ],
      responses: ok({ type: 'object' }),
    },
    post: {
      tags: ['Leitores'], summary: 'Cadastrar leitor (admin/bibliotecário)',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReaderInput' } } } },
      responses: created({ $ref: '#/components/schemas/Reader' }),
    },
  },
  '/readers/{id}': {
    get: { tags: ['Leitores'], summary: 'Obter leitor', parameters: [idParam], responses: ok({ $ref: '#/components/schemas/Reader' }) },
    put: {
      tags: ['Leitores'], summary: 'Atualizar leitor', parameters: [idParam],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ReaderInput' } } } },
      responses: ok({ $ref: '#/components/schemas/Reader' }),
    },
    delete: { tags: ['Leitores'], summary: 'Excluir leitor (admin)', parameters: [idParam], responses: ok({ type: 'object' }) },
  },
  '/readers/{id}/loans': {
    get: { tags: ['Leitores'], summary: 'Histórico de empréstimos do leitor', parameters: [idParam], responses: ok({ type: 'object' }) },
  },
  '/readers/{id}/inactivate': {
    patch: { tags: ['Leitores'], summary: 'Inativar leitor', parameters: [idParam], responses: ok({ $ref: '#/components/schemas/Reader' }) },
  },
  '/readers/{id}/activate': {
    patch: { tags: ['Leitores'], summary: 'Ativar leitor', parameters: [idParam], responses: ok({ $ref: '#/components/schemas/Reader' }) },
  },

  '/loans': {
    get: {
      tags: ['Empréstimos'], summary: 'Listar empréstimos (leitor vê apenas os próprios)',
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['open', 'returned', 'late'] } },
        { name: 'readerId', in: 'query', schema: { type: 'integer' } },
        { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
      ],
      responses: ok({ type: 'object' }),
    },
    post: {
      tags: ['Empréstimos'], summary: 'Registrar empréstimo (admin/bibliotecário)',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoanInput' } } } },
      responses: { ...created({ $ref: '#/components/schemas/Loan' }), ...errResp(409, 'Sem disponibilidade ou leitor inativo') },
    },
  },
  '/loans/overdue': {
    get: { tags: ['Empréstimos'], summary: 'Listar empréstimos atrasados', responses: ok({ type: 'object' }) },
  },
  '/loans/{id}': {
    get: { tags: ['Empréstimos'], summary: 'Obter empréstimo', parameters: [idParam], responses: ok({ $ref: '#/components/schemas/Loan' }) },
    delete: { tags: ['Empréstimos'], summary: 'Excluir empréstimo devolvido (admin)', parameters: [idParam], responses: ok({ type: 'object' }) },
  },
  '/loans/{id}/return': {
    patch: { tags: ['Empréstimos'], summary: 'Registrar devolução (admin/bibliotecário)', parameters: [idParam], responses: { ...ok({ $ref: '#/components/schemas/Loan' }), ...errResp(409, 'Já devolvido') } },
  },

  '/reports/summary': {
    get: { tags: ['Relatórios'], summary: 'Resumo geral do sistema (admin/bibliotecário)', responses: ok({ type: 'object' }) },
  },
  '/reports/popular-books': {
    get: { tags: ['Relatórios'], summary: 'Livros mais emprestados', responses: ok({ type: 'object' }) },
  },
};

const definition = {
  openapi: '3.0.0',
  info: {
    title: 'API - Sistema de Gerenciamento de Biblioteca',
    version: '1.0.0',
    description:
      'API REST do Projeto 2 (UTFPR). Autenticação via JWT. ' +
      'Clique em **Authorize** e informe o token retornado por `/auth/login` para testar as rotas protegidas.',
  },
  servers: [{ url: `http://localhost:${env.port}/api`, description: 'Servidor local' }],
  tags: [
    { name: 'Autenticação' },
    { name: 'Usuários' },
    { name: 'Livros' },
    { name: 'Leitores' },
    { name: 'Empréstimos' },
    { name: 'Relatórios' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas,
  },
  security: [{ bearerAuth: [] }],
  paths,
};

// Sem apis (globs) -> swaggerJSDoc retorna a definição completa acima
const swaggerSpec = swaggerJSDoc({ definition, apis: [] });

module.exports = swaggerSpec;
