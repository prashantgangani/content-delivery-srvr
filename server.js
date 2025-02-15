const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

app.use(express.static('public'));

let logs = [];

app.use((req, res, next) => {
  const log = { id: logs.length + 1, ip: req.ip, time: new Date().toISOString() };
  logs.push(log); // In-memory log storage
  const logEntry = `IP: ${req.ip}, Time: ${log.time}\n`;
  fs.appendFile(path.join(__dirname, 'visits.log'), logEntry, (err) => {
    if (err) console.log(err);
  });
  next();
});


app.get('/logs', (req, res) => {
  res.json({ logs: logs });
});

app.post('/logs', (req, res) => {
  const { ip, time } = req.body;

  if (!ip || !time) {
    return res.status(400).send('IP and Time are required');
  }

  const newLog = { id: logs.length + 1, ip, time };
  logs.push(newLog);
  res.status(201).json(newLog);
});

app.put('/logs/:id', (req, res) => {
  const logId = parseInt(req.params.id);
  const { ip, time } = req.body;

  const log = logs.find(l => l.id === logId);
  if (!log) return res.status(404).send('Log not found');

  log.ip = ip;
  log.time = time;
  res.json(log);
});

app.delete('/logs/:id', (req, res) => {
  const logId = parseInt(req.params.id);
  const logIndex = logs.findIndex(l => l.id === logId);

  if (logIndex === -1) {
    return res.status(404).send('Log not found');
  }

  logs.splice(logIndex, 1);
  res.status(200).send(`Log with ID ${logId} deleted`);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});