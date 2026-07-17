const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');
const app = express();
const port = 3000;
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
app.use(express.json());

const { createClient } = require('redis');
const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.connect().catch(console.error);

app.get('/health', async (req, res) => {
  const dbStatus = await pool.query('SELECT 1');
  const redisStatus = redisClient.isOpen ? 'ok' : 'disconnected';
  res.json({ db: dbStatus, redis: redisStatus });
});

app.get('/', (req, res) => {
  res.json({
    name: "Task API", 
    version: "1.0", 
    endpoints: ["/tasks","/docs","/health"]
  })
});


app.get('/tasks', async (req, res) =>{
  try {
    const result = await pool.query('SELECT * FROM tasks');
    res.json(result.rows)
  }
  catch (err) {
    res.status(500).json({ error: "Database error" });
  }
})

app.get('/tasks/:id', async (req, res) =>{
  const id = parseInt(req.params.id);
  try {
    const task = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])
    if (task.rows.length){
      res.json(task.rows[0]);
    }
    else{
      res.status(404).json({ error: `Task ${id} not found` });
    }
  }
  catch (err) {
    res.status(500).json({ error: "Database error" });
  }

})

app.post('/tasks', async (req, res) =>{
  const { title } = req.body;

  if (!title || title.trim()==="" ){
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, done) VALUES ($1, false) RETURNING *',
      [title]
    );
    res.status(201).json(result.rows[0]);
  }
  catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.put('/tasks/:id', async (req, res) =>{
  const id = parseInt(req.params.id);
  const { title, done } = req.body;

  if (title !== undefined && (typeof title !== 'string' || title.trim() === "")){
    return res.status(400).json({ error: "Title cannot be empty" });
  }

  try {
    const task = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (task.rows.length === 0) {
      return res.status(404).json({ error: `Task ${id} not found` });
    }

    const result = await pool.query(
      'UPDATE tasks SET title = COALESCE($1, title), done = COALESCE($2, done) WHERE id = $3 RETURNING *',
      [title, done, id]
    );
    res.json(result.rows[0]);
  } 
  catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Task ${id} not found` });
    }
    res.status(204).send();
  } 
  catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

