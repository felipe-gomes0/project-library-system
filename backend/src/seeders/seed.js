const env = require('../config/env');
const db = require('../models');
const { ROLES, READER_STATUS, BOOK_STATUS } = require('../utils/constants');

const { sequelize, User, Reader, Book } = db;

async function seed() {
  await sequelize.authenticate();
  console.log('✅ Conectado ao banco.');

  const force = env.db.sync === 'force';
  await sequelize.sync({ force, alter: !force && env.db.sync === 'alter' });
  console.log(force ? '⚠️  Tabelas recriadas (force).' : '✅ Tabelas sincronizadas.');

  const [admin] = await User.findOrCreate({
    where: { email: env.admin.email },
    defaults: { name: env.admin.name, password: env.admin.password, role: ROLES.ADMIN },
  });

  const [librarian] = await User.findOrCreate({
    where: { email: 'bibliotecario@biblioteca.com' },
    defaults: { name: 'Maria Bibliotecária', password: 'biblio123', role: ROLES.LIBRARIAN },
  });

  const [readerUser1] = await User.findOrCreate({
    where: { email: 'joao@aluno.com' },
    defaults: { name: 'João da Silva', password: 'leitor123', role: ROLES.READER },
  });
  const [readerUser2] = await User.findOrCreate({
    where: { email: 'ana@aluno.com' },
    defaults: { name: 'Ana Souza', password: 'leitor123', role: ROLES.READER },
  });

  await Reader.findOrCreate({
    where: { document: '111.111.111-11' },
    defaults: {
      name: 'João da Silva',
      email: 'joao@aluno.com',
      phone: '(41) 99999-1111',
      address: 'Rua A, 100 - Curitiba/PR',
      status: READER_STATUS.ACTIVE,
      user_id: readerUser1.id,
    },
  });
  await Reader.findOrCreate({
    where: { document: '222.222.222-22' },
    defaults: {
      name: 'Ana Souza',
      email: 'ana@aluno.com',
      phone: '(41) 99999-2222',
      address: 'Rua B, 200 - Curitiba/PR',
      status: READER_STATUS.ACTIVE,
      user_id: readerUser2.id,
    },
  });
  await Reader.findOrCreate({
    where: { document: '333.333.333-33' },
    defaults: {
      name: 'Carlos Pereira',
      email: 'carlos@aluno.com',
      phone: '(41) 99999-3333',
      address: 'Rua C, 300 - Curitiba/PR',
      status: READER_STATUS.ACTIVE,
    },
  });

  const books = [
    { title: 'Dom Casmurro', author: 'Machado de Assis', publisher: 'Editora Brasil', publicationYear: 1899, category: 'Romance', isbn: '978-85-359-0277-1', totalQuantity: 5 },
    { title: 'O Cortiço', author: 'Aluísio Azevedo', publisher: 'Ática', publicationYear: 1890, category: 'Romance', isbn: '978-85-359-0277-2', totalQuantity: 3 },
    { title: 'Memórias Póstumas de Brás Cubas', author: 'Machado de Assis', publisher: 'Penguin', publicationYear: 1881, category: 'Romance', isbn: '978-85-359-0277-3', totalQuantity: 4 },
    { title: 'Capitães da Areia', author: 'Jorge Amado', publisher: 'Companhia das Letras', publicationYear: 1937, category: 'Romance', isbn: '978-85-359-0277-4', totalQuantity: 2 },
    { title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', publisher: 'Agir', publicationYear: 1943, category: 'Infantil', isbn: '978-85-359-0277-5', totalQuantity: 6 },
    { title: 'Algoritmos: Teoria e Prática', author: 'Thomas H. Cormen', publisher: 'GEN LTC', publicationYear: 2012, category: 'Tecnologia', isbn: '978-85-352-3699-6', totalQuantity: 3 },
    { title: 'Código Limpo', author: 'Robert C. Martin', publisher: 'Alta Books', publicationYear: 2009, category: 'Tecnologia', isbn: '978-85-765-2274-1', totalQuantity: 4 },
    { title: 'A Revolução dos Bichos', author: 'George Orwell', publisher: 'Companhia das Letras', publicationYear: 1945, category: 'Ficção', isbn: '978-85-359-0277-8', totalQuantity: 5 },
  ];

  for (const b of books) {
    await Book.findOrCreate({
      where: { isbn: b.isbn },
      defaults: {
        ...b,
        availableQuantity: b.totalQuantity,
        status: BOOK_STATUS.AVAILABLE,
      },
    });
  }

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('\n===== Credenciais de acesso =====');
  console.log(`Administrador : ${env.admin.email} / ${env.admin.password}`);
  console.log('Bibliotecário : bibliotecario@biblioteca.com / biblio123');
  console.log('Leitor 1      : joao@aluno.com / leitor123');
  console.log('Leitor 2      : ana@aluno.com / leitor123');
  console.log('=================================\n');

  await sequelize.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Erro ao executar o seed:', err);
  process.exit(1);
});
