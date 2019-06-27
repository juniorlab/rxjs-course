const express = require('express');
const path = require('path');
const countries = require('./countries').countries;

const app = express();
app.use(express.static(path.resolve(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'views/index.html'));
});

app.get('/api/countries', (req, res) => {
  res.json(countries.filter((country) => country.toLowerCase().includes(req.query.query.toLowerCase())));
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});