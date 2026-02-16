const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  /**
   * @swagger
   * /api/libros:
   *   get:
   *     summary: Obtener todos los libros de la Biblia
   *     tags: [Libros]
   *     responses:
   *       200:
   *         description: Lista de libros
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                   nombre:
   *                     type: string
   */
  router.get('/libros', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM libros ORDER BY id');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/libros/{id}:
   *   get:
   *     summary: Obtener un libro por ID
   *     tags: [Libros]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del libro
   *     responses:
   *       200:
   *         description: Datos del libro
   *       404:
   *         description: Libro no encontrado
   */
  router.get('/libros/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM libros WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Libro no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/libros/{id}/capitulos:
   *   get:
   *     summary: Obtener todos los capítulos de un libro
   *     tags: [Capítulos]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del libro
   *     responses:
   *       200:
   *         description: Lista de capítulos del libro
   */
  router.get('/libros/:id/capitulos', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM capitulos WHERE libro_id = $1 ORDER BY numero', [id]);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/capitulos/{id}:
   *   get:
   *     summary: Obtener un capítulo por ID
   *     tags: [Capítulos]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del capítulo
   *     responses:
   *       200:
   *         description: Datos del capítulo
   *       404:
   *         description: Capítulo no encontrado
   */
  router.get('/capitulos/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM capitulos WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Capítulo no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/capitulos/{id}/versiculos:
   *   get:
   *     summary: Obtener todos los versículos de un capítulo
   *     tags: [Versículos]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del capítulo
   *     responses:
   *       200:
   *         description: Lista de versículos del capítulo
   */
  router.get('/capitulos/:id/versiculos', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM versiculos WHERE capitulo_id = $1 ORDER BY numero', [id]);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/versiculos/{id}:
   *   get:
   *     summary: Obtener un versículo por ID
   *     tags: [Versículos]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del versículo
   *     responses:
   *       200:
   *         description: Datos del versículo
   *       404:
   *         description: Versículo no encontrado
   */
  router.get('/versiculos/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM versiculos WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Versículo no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/buscar:
   *   get:
   *     summary: Buscar versículos por texto
   *     tags: [Búsqueda]
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: Texto a buscar en los versículos
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Número máximo de resultados
   *     responses:
   *       200:
   *         description: Versículos que contienen el texto buscado
   */
  router.get('/buscar', async (req, res) => {
    try {
      const { q, limit = 20 } = req.query;
      if (!q) {
        return res.status(400).json({ error: 'Parámetro de búsqueda requerido (q)' });
      }
      const result = await pool.query(
        `SELECT v.id, v.numero, v.texto, c.numero as capitulo, l.nombre as libro
         FROM versiculos v
         JOIN capitulos c ON v.capitulo_id = c.id
         JOIN libros l ON c.libro_id = l.id
         WHERE v.texto ILIKE $1
         LIMIT $2`,
        [`%${q}%`, limit]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/versiculo/{libro}/{capitulo}/{versiculo}:
   *   get:
   *     summary: Obtener un versículo específico por libro, capítulo y número de versículo
   *     tags: [Versículos]
   *     parameters:
   *       - in: path
   *         name: libro
   *         required: true
   *         schema:
   *           type: string
   *         description: Nombre del libro (ej. Génesis)
   *       - in: path
   *         name: capitulo
   *         required: true
   *         schema:
   *           type: integer
   *         description: Número del capítulo
   *       - in: path
   *         name: versiculo
   *         required: true
   *         schema:
   *           type: integer
   *         description: Número del versículo
   *     responses:
   *       200:
   *         description: Texto del versículo
   *       404:
   *         description: Versículo no encontrado
   */
  router.get('/versiculo/:libro/:capitulo/:versiculo', async (req, res) => {
    try {
      const { libro, capitulo, versiculo } = req.params;
      const result = await pool.query(
        `SELECT v.id, v.numero, v.texto, c.numero as capitulo, l.nombre as libro
         FROM versiculos v
         JOIN capitulos c ON v.capitulo_id = c.id
         JOIN libros l ON c.libro_id = l.id
         WHERE l.nombre ILIKE $1 AND c.numero = $2 AND v.numero = $3`,
        [libro, capitulo, versiculo]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Versículo no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
