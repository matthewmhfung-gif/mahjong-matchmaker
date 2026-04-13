const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/players
router.get('/', (req, res) => {
  const { variant, skill_level, search } = req.query;

  let query = 'SELECT * FROM players WHERE 1=1';
  const params = [];

  if (variant) {
    query += ' AND variant = ?';
    params.push(variant);
  }
  if (skill_level) {
    query += ' AND skill_level = ?';
    params.push(skill_level);
  }
  if (search) {
    query += ' AND (name LIKE ? OR notes LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC';

  const players = db.prepare(query).all(...params);
  res.json(players.map((p) => ({ ...p, availability: JSON.parse(p.availability) })));
});

// GET /api/players/:id
router.get('/:id', (req, res) => {
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });
  res.json({ ...player, availability: JSON.parse(player.availability) });
});

// POST /api/players
router.post('/', (req, res) => {
  const { name, skill_level, variant, availability, notes } = req.body;

  if (!name || !skill_level || !variant) {
    return res.status(400).json({ error: 'name, skill_level, and variant are required' });
  }

  const validSkills = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const validVariants = ['American', 'Japanese Riichi', 'Hong Kong', 'Chinese Classical'];

  if (!validSkills.includes(skill_level)) {
    return res.status(400).json({ error: 'Invalid skill_level' });
  }
  if (!validVariants.includes(variant)) {
    return res.status(400).json({ error: 'Invalid variant' });
  }

  const result = db
    .prepare(
      `INSERT INTO players (name, skill_level, variant, availability, notes)
     VALUES (?, ?, ?, ?, ?)`
    )
    .run(name.trim(), skill_level, variant, JSON.stringify(availability || []), notes || '');

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...player, availability: JSON.parse(player.availability) });
});

// PUT /api/players/:id
router.put('/:id', (req, res) => {
  const { name, skill_level, variant, availability, notes } = req.body;

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  db.prepare(
    `UPDATE players SET name = ?, skill_level = ?, variant = ?, availability = ?, notes = ?
     WHERE id = ?`
  ).run(
    name ?? player.name,
    skill_level ?? player.skill_level,
    variant ?? player.variant,
    JSON.stringify(availability ?? JSON.parse(player.availability)),
    notes !== undefined ? notes : player.notes,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  res.json({ ...updated, availability: JSON.parse(updated.availability) });
});

// DELETE /api/players/:id
router.delete('/:id', (req, res) => {
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });
  db.prepare('DELETE FROM players WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
