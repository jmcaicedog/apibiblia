// Script para cargar los datos de la Biblia desde el JSON a Neon (PostgreSQL)
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  // Leer el archivo JSON

  const data = JSON.parse(fs.readFileSync('./json/biblia_jerusalen_1976.json', 'utf8'));

  // Crear tablas según la estructura del JSON
  await pool.query(`
    DROP TABLE IF EXISTS versiculos;
    DROP TABLE IF EXISTS capitulos;
    DROP TABLE IF EXISTS libros;
    CREATE TABLE IF NOT EXISTS libros (
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS capitulos (
      id SERIAL PRIMARY KEY,
      libro_id INTEGER REFERENCES libros(id),
      numero INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS versiculos (
      id SERIAL PRIMARY KEY,
      capitulo_id INTEGER REFERENCES capitulos(id),
      numero INTEGER NOT NULL,
      texto TEXT NOT NULL
    );
  `);

  let totalLibros = 0, totalCapitulos = 0, totalVersiculos = 0;
  for (const book of data.books) {
    totalLibros++;
    console.log(`Procesando libro: ${book.name}`);
    const resLibro = await pool.query('INSERT INTO libros(nombre) VALUES($1) RETURNING id', [book.name]);
    const libroId = resLibro.rows[0].id;
    for (const chapter of book.chapters) {
      totalCapitulos++;
      console.log(`  Capítulo: ${chapter.chapter}`);
      const resCap = await pool.query('INSERT INTO capitulos(libro_id, numero) VALUES($1, $2) RETURNING id', [libroId, chapter.chapter]);
      const capituloId = resCap.rows[0].id;
      
      // verses es un objeto con claves numéricas ("1", "2", etc.)
      if (!chapter.verses || typeof chapter.verses !== 'object') {
        console.warn(`    Capítulo problemático: Libro '${book.name}', capítulo ${chapter.chapter} (verses inválido)`);
        continue;
      }
      
      const versiculoKeys = Object.keys(chapter.verses).sort((a, b) => parseInt(a) - parseInt(b));
      for (const key of versiculoKeys) {
        const texto = chapter.verses[key];
        const versiculoNum = parseInt(key);
        totalVersiculos++;
        if (versiculoNum === 1 || versiculoNum % 50 === 0) {
          console.log(`    Versículo ${versiculoNum}: ${texto.substring(0, 30)}...`);
        }
        await pool.query('INSERT INTO versiculos(capitulo_id, numero, texto) VALUES($1, $2, $3)', [capituloId, versiculoNum, texto]);
      }
    }
  }
  console.log(`Total libros: ${totalLibros}`);
  console.log(`Total capítulos: ${totalCapitulos}`);
  console.log(`Total versículos: ${totalVersiculos}`);

  console.log('Datos cargados correctamente.');
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
