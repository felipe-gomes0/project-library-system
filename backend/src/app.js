const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'API Biblioteca - Documentação',
}));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// Rotas da API
app.use('/api', routes);

// Raiz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API do Sistema de Gerenciamento de Biblioteca',
    docs: '/api-docs',
    api: '/api',
  });
});

// 404 + tratamento central de erros
app.use(notFound);
app.use(errorHandler);

module.exports = app;
