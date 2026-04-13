const express = require('express');
const router = express.Router();
const db = require('../db');

function getSessionWithPlayers(sessionId) {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
  if (!session) return null;

  const players = db
    .prepare(
      `SELECT p.*, sp.joined_at FROM players p
       JOIN session_players sp ON p.id = sp.player_id
       WHERE sp.session_id = ?
       ORDER BY sp.joined_at ASC`
    )
    .all(sessionId);

  return {
    ...session,
    players: players.map((p) => ({ ...p, availability: JSON.parse(p.availability) })),
    seats_filled: players.length,
    seats_available: session.max_players - players.length,
  };
}

// GET /api/sessions
router.get('/', (req, res) => {
  const { variant } = req.query;

  let query = 'SELECT * FROM sessions WHERE 1=1';
  const params = [];

  if (variant) {
    query += ' AND variant = ?';
    params.push(variant);
  }

  query += ' ORDER BY date_time ASC';

  const sessions = db.prepare(query).all(...params);
  const enriched = sessions.map((s) => {
    const playerCount = db
      .prepare('SELECT COUNT(*) as count FROM session_players WHERE session_id = ?')
      .get(s.id);
    return {
      ...s,
      seats_filled: playerCount.count,
      seats_available: s.max_players - playerCount.count,
    };
  });

  res.json(enriched);
});

// GET /api/sessions/:id
router.get('/:id', (req, res) => {
  const session = getSessionWithPlayers(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

// POST /api/sessions
router.post('/', (req, res) => {
  const { title, date_time, variant, skill_requirement, max_players, location, notes, creator_id } =
    req.body;

  if (!title || !date_time || !variant || !skill_requirement) {
    return res
      .status(400)
      .json({ error: 'title, date_time, variant, and skill_requirement are required' });
  }

  const result = db
    .prepare(
      `INSERT INTO sessions (title, date_time, variant, skill_requirement, max_players, location, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(title.trim(), date_time, variant, skill_requirement, max_players || 4, location || '', notes || '');

  const sessionId = result.lastInsertRowid;

  // Auto-join creator if provided
  if (creator_id) {
    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(creator_id);
    if (player) {
      db.prepare('INSERT INTO session_players (session_id, player_id) VALUES (?, ?)').run(
        sessionId,
        creator_id
      );
    }
  }

  res.status(201).json(getSessionWithPlayers(sessionId));
});

// POST /api/sessions/:id/join
router.post('/:id/join', (req, res) => {
  const { player_id } = req.body;

  if (!player_id) return res.status(400).json({ error: 'player_id is required' });

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(player_id);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const existing = db
    .prepare('SELECT * FROM session_players WHERE session_id = ? AND player_id = ?')
    .get(req.params.id, player_id);
  if (existing) return res.status(409).json({ error: 'Player already in this session' });

  const seatCount = db
    .prepare('SELECT COUNT(*) as count FROM session_players WHERE session_id = ?')
    .get(req.params.id);
  if (seatCount.count >= session.max_players) {
    return res.status(409).json({ error: 'Session is full' });
  }

  db.prepare('INSERT INTO session_players (session_id, player_id) VALUES (?, ?)').run(
    req.params.id,
    player_id
  );

  const updated = getSessionWithPlayers(req.params.id);

  // Check if session is now full - emit notification placeholder
  if (updated.seats_filled === updated.max_players) {
    console.log(
      `[NOTIFICATION] Session "${session.title}" is now full with ${updated.max_players} players!`
    );
  }

  res.json(updated);
});

// DELETE /api/sessions/:id/leave
router.delete('/:id/leave', (req, res) => {
  const { player_id } = req.body;

  if (!player_id) return res.status(400).json({ error: 'player_id is required' });

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const existing = db
    .prepare('SELECT * FROM session_players WHERE session_id = ? AND player_id = ?')
    .get(req.params.id, player_id);
  if (!existing) return res.status(404).json({ error: 'Player not in this session' });

  db.prepare('DELETE FROM session_players WHERE session_id = ? AND player_id = ?').run(
    req.params.id,
    player_id
  );

  res.json(getSessionWithPlayers(req.params.id));
});

// DELETE /api/sessions/:id
router.delete('/:id', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  db.prepare('DELETE FROM sessions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
