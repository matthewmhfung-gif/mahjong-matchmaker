const express = require('express');
const cors = require('cors');
const path = require('path');
const { seed } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

// CORS — open in dev, locked to CLIENT_URL in production
app.use(
  cors({
    origin: IS_PROD ? process.env.CLIENT_URL : '*',
    credentials: true,
  })
);

app.use(express.json());

// Seed DB on startup
seed();

// API routes
app.use('/api/players', require('./routes/players'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/matchmaking', require('./routes/matchmaking'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// In production, serve the built React app from client/dist
if (IS_PROD) {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));

  // All non-API routes return index.html so React Router works
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Mahjong Matchmaker API running at http://localhost:${PORT}`);
  if (IS_PROD) console.log(`Serving React app in production mode`);
});
