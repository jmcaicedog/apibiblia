# API Biblia Católica

API REST para consultar la Biblia católica en español (Biblia de Jerusalén 1976).

## Características

- **73 libros** de la Biblia católica
- **1,189 capítulos**
- **33,043 versículos**
- Documentación interactiva con Swagger
- Base de datos PostgreSQL (Neon)
- Despliegue en Vercel

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/libros` | Listar todos los libros |
| GET | `/api/libros/:id` | Obtener un libro por ID |
| GET | `/api/libros/:id/capitulos` | Listar capítulos de un libro |
| GET | `/api/capitulos/:id` | Obtener un capítulo por ID |
| GET | `/api/capitulos/:id/versiculos` | Listar versículos de un capítulo |
| GET | `/api/versiculos/:id` | Obtener un versículo por ID |
| GET | `/api/versiculo/:libro/:capitulo/:versiculo` | Obtener versículo por referencia (ej: Génesis/1/1) |
| GET | `/api/buscar?q=texto&limit=20` | Buscar versículos por texto |

## Documentación

Al abrir la URL raíz del proyecto, se muestra la documentación interactiva de Swagger.

## Instalación local

1. Clona el repositorio
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` con:
   ```
   DATABASE_URL=tu_cadena_de_conexion_neon
   PORT=3000
   ```
4. Ejecuta el servidor:
   ```bash
   npm run dev
   ```

## Cargar datos

Si necesitas cargar los datos de la Biblia en la base de datos:

```bash
node src/cargar_biblia.js
```

## Despliegue en Vercel

1. Instala Vercel CLI: `npm i -g vercel`
2. Ejecuta: `vercel`
3. Configura la variable de entorno `DATABASE_URL` en el panel de Vercel

## Tecnologías

- Node.js + Express
- PostgreSQL (Neon)
- Swagger (swagger-jsdoc + swagger-ui-express)
- Vercel (despliegue serverless)

## Licencia

MIT