require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());

// Conexión a Neon (PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Configuración de Swagger
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Biblia Católica',
    version: '1.0.0',
    description: 'API REST para consultar la Biblia católica en español (Biblia de Jerusalén 1976). Incluye 73 libros, 1189 capítulos y más de 33,000 versículos.'
  },
  servers: [
    { url: '/', description: 'Servidor actual' }
  ],
  tags: [
    { name: 'Libros', description: 'Operaciones sobre libros de la Biblia' },
    { name: 'Capítulos', description: 'Operaciones sobre capítulos' },
    { name: 'Versículos', description: 'Operaciones sobre versículos' },
    { name: 'Búsqueda', description: 'Búsqueda de texto en la Biblia' }
  ]
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, 'routes', '*.js')]
};
const swaggerSpec = swaggerJSDoc(options);

// Rutas de la API
const bibleRoutes = require('./routes/bible')(pool);
app.use('/api', bibleRoutes);

// Endpoint para obtener la especificación Swagger en JSON
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

// Swagger UI en la raíz
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'API Biblia Católica - Documentación'
}));

// Solo inicia el servidor si no está en Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
}

// Exportar para Vercel
module.exports = app;
