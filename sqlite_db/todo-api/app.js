const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');
const app = express();
const port = 3000;
const sqlite3 = require('sqlite3');
app.use(express.json());


const db = new sqlite3.Database('tasks.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  }
  else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT 0
    )
  `, () => {
    // Check count and seed if empty
    db.get('SELECT COUNT(*) as count FROM tasks', (err, row) => {
      if (row.count === 0){
        const stmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
        stmt.run('Complete assignment', 0);
        stmt.run('Water Plants', 1);
        stmt.run('Test advisor patience', 0);
        stmt.finalize();
        console.log('Added 3 initial tasks.');
      } 
      else{
        console.log('3 initial tasks already exist');
      }
    });
  });
});


// const { createClient } = require('redis');
// const redisClient = createClient({ url: process.env.REDIS_URL });

// redisClient.connect().catch(console.error);

let tasks = [
  {id: 1, title: "Complete assignment 1", done: false},
  
  {id: 2, title: "Water plants", done: true},
  
  {id: 3, title: "Grade papers", done: false},
]


app.get('/', (req, res) => {
  res.json({
    name: "Task API", 
    version: "1.0", 
    endpoints: ["/tasks"]
  })
});


app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});


app.get('/tasks', (req, res) =>{
  res.json(tasks);
})

app.get('/tasks/:id', (req, res) =>{
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);

  if (task){
    res.json(task);
  }
  else{
    res.status(404).json({ error: `Task ${id} not found` });
  }
})

app.post('/tasks', (req, res) =>{
  const { title } = req.body;

  if (!title || title.trim()==="" ){
    return res.status(400).json({ error: "Title is required" });
  }

  const newTask = {
    id: tasks.length + 1,
    title: title,
    done: false
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/tasks/:id', (req, res) =>{
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);

  if (!task){
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  const { title, done } = req.body;

  if (title !== undefined && (typeof title !== 'string' || title.trim() === "")){
    return res.status(400).json({ error: "Title cannot be empty" });
  }

  if (title !== undefined) task.title = title;
  if (done !== undefined) task.done = done;

  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1){
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  tasks.splice(index, 1);
  
  res.status(204).send();
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

