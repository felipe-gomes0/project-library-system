const app = require('./app');
const env = require('./config/env');
const db = require('./models');

async function start() {
  try {
    // Testa a conexão com o banco
    await db.sequelize.authenticate();
    console.log('✅ Conexão com o PostgreSQL estabelecida.');

    // Sincroniza os models conforme DB_SYNC (none | alter | force)
    if (env.db.sync === 'force') {
      await db.sequelize.sync({ force: true });
      console.log('⚠️  Tabelas recriadas (force).');
    } else if (env.db.sync === 'alter') {
      await db.sequelize.sync({ alter: true });
      console.log('✅ Tabelas sincronizadas (alter).');
    } else {
      console.log('ℹ️  Sincronização automática desativada (DB_SYNC=none).');
    }

    app.listen(env.port, () => {
      console.log(`🚀 API rodando em http://localhost:${env.port}`);
      console.log(`📚 Documentação Swagger em http://localhost:${env.port}/api-docs`);
    });
  } catch (err) {
    console.error('❌ Falha ao iniciar a aplicação:', err.message);
    console.error('   Verifique se o banco PostgreSQL está rodando (docker compose up -d db).');
    process.exit(1);
  }
}

start();
