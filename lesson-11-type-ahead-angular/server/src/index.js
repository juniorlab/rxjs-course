const express = require('express');
const countries = require('./countries').countries;

const app = express();

app.get('/api/countries', (req, res) => {
  res.json(countries.filter((country) => country.toLowerCase().includes(req.query.query.toLowerCase())));
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});