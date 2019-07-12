const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.resolve(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'views/index.html'));
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
