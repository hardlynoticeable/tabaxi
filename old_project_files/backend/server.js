const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static files (we can serve the assets folder from the root)
app.use('/assets', express.static(path.join(__dirname, '../assets')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tabaxi Generator Backend running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
