require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Conexión a Neon (PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Especificación Swagger definida directamente
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API Biblia Católica',
    version: '1.0.0',
    description: 'API REST para consultar la Biblia católica en español (Biblia de Jerusalén 1976). Incluye 73 libros, 1189 capítulos y más de 33,000 versículos.'
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'Libros', description: 'Operaciones sobre libros de la Biblia' },
    { name: 'Capítulos', description: 'Operaciones sobre capítulos' },
    { name: 'Versículos', description: 'Operaciones sobre versículos' },
    { name: 'Búsqueda', description: 'Búsqueda de texto en la Biblia' }
  ],
  paths: {
    '/api/libros': {
      get: {
        summary: 'Obtener todos los libros de la Biblia',
        tags: ['Libros'],
        responses: {
          200: {
            description: 'Lista de libros',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      nombre: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/libros/{id}': {
      get: {
        summary: 'Obtener un libro por ID',
        tags: ['Libros'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del libro' }
        ],
        responses: {
          200: { description: 'Datos del libro' },
          404: { description: 'Libro no encontrado' }
        }
      }
    },
    '/api/libros/{id}/capitulos': {
      get: {
        summary: 'Obtener todos los capítulos de un libro',
        tags: ['Capítulos'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del libro' }
        ],
        responses: {
          200: { description: 'Lista de capítulos del libro' }
        }
      }
    },
    '/api/capitulos/{id}': {
      get: {
        summary: 'Obtener un capítulo por ID',
        tags: ['Capítulos'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del capítulo' }
        ],
        responses: {
          200: { description: 'Datos del capítulo' },
          404: { description: 'Capítulo no encontrado' }
        }
      }
    },
    '/api/capitulos/{id}/versiculos': {
      get: {
        summary: 'Obtener todos los versículos de un capítulo',
        tags: ['Versículos'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del capítulo' }
        ],
        responses: {
          200: { description: 'Lista de versículos del capítulo' }
        }
      }
    },
    '/api/versiculos/{id}': {
      get: {
        summary: 'Obtener un versículo por ID',
        tags: ['Versículos'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del versículo' }
        ],
        responses: {
          200: { description: 'Datos del versículo' },
          404: { description: 'Versículo no encontrado' }
        }
      }
    },
    '/api/versiculo/{libro}/{capitulo}/{versiculo}': {
      get: {
        summary: 'Obtener un versículo por libro, capítulo y número',
        tags: ['Versículos'],
        parameters: [
          { name: 'libro', in: 'path', required: true, schema: { type: 'string' }, description: 'Nombre del libro (ej: Génesis)' },
          { name: 'capitulo', in: 'path', required: true, schema: { type: 'integer' }, description: 'Número del capítulo' },
          { name: 'versiculo', in: 'path', required: true, schema: { type: 'integer' }, description: 'Número del versículo' }
        ],
        responses: {
          200: { description: 'Texto del versículo' },
          404: { description: 'Versículo no encontrado' }
        }
      }
    },
    '/api/buscar': {
      get: {
        summary: 'Buscar versículos por texto',
        tags: ['Búsqueda'],
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Texto a buscar' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Número máximo de resultados' }
        ],
        responses: {
          200: { description: 'Versículos encontrados' }
        }
      }
    }
  }
};

// Rutas de la API
const bibleRoutes = require('./routes/bible')(pool);
app.use('/api', bibleRoutes);

// Endpoint para la especificación OpenAPI en JSON
app.get('/openapi.json', (req, res) => {
  res.json(swaggerSpec);
});

// Swagger UI usando CDN (funciona en Vercel)
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Biblia Católica - Documentación</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>
  `);
});

// Solo inicia el servidor si no está en Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
}

// Exportar para Vercel
module.exports = app;
