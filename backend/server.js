const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  user: process.env.DB_USER || 'nadra',
  password: process.env.DB_PASSWORD || 'nadra123',
  database: process.env.DB_NAME || 'nadradb',
  port: 5432
});

// Database setup
pool.query(`
  CREATE TABLE IF NOT EXISTS citizens (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    cnic VARCHAR(15),
    city VARCHAR(50)
  );
  INSERT INTO citizens (name, cnic, city) 
  SELECT 'Ahmed Ali', '35201-1234567-1', 'Lahore'
  WHERE NOT EXISTS (SELECT 1 FROM citizens WHERE cnic = '35201-1234567-1');
  INSERT INTO citizens (name, cnic, city)
  SELECT 'Sara Khan', '42101-7654321-2', 'Karachi'
  WHERE NOT EXISTS (SELECT 1 FROM citizens WHERE cnic = '42101-7654321-2');
  INSERT INTO citizens (name, cnic, city)
  SELECT 'Ali Raza', '61101-9876543-3', 'Islamabad'
  WHERE NOT EXISTS (SELECT 1 FROM citizens WHERE cnic = '61101-9876543-3');
`).catch(err => console.log('DB setup error:', err));

// Search API
app.get('/search', async (req, res) => {
  const { name } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM citizens WHERE name ILIKE $1',
      [`%${name}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000, () => {
  console.log('NADRA Backend running on port 3000');
});
