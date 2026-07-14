const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

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

  if (!title){
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});