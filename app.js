const express = require('express');
const app = express();
const port = 3000;

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

app.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);

  if (task){
    res.json(task);
  }
  else{
    res.status(404).json({ error: `Task ${id} not found` });
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});