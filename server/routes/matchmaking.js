const express = require('express');
const router = express.Router();
const db = require('../db');

const SKILL_RANK = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function calcAvailabilityOverlap(players) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let totalHours = 0;
  const sharedSlots = [];

  for (const day of days) {
    // Collect each player's time ranges for this day
    const playerRanges = players.map((p) => {
      const avail = JSON.parse(p.availability);
      return avail.filter((slot) => slot.day === day);
    });

    // Every player must have at least one slot on this day
    if (playerRanges.some((ranges) => ranges.length === 0)) continue;

    // Find intersection of first slot per player (simplified)
    const starts = playerRanges.map((ranges) => timeToMinutes(ranges[0].startTime));
    const ends = playerRanges.map((ranges) => timeToMinutes(ranges[0].endTime));

    const overlapStart = Math.max(...starts);
    const overlapEnd = Math.min(...ends);

    if (overlapEnd > overlapStart) {
      const hours = (overlapEnd - overlapStart) / 60;
      totalHours += hours;
      sharedSlots.push({
        day,
        startTime: `${Math.floor(overlapStart / 60).toString().padStart(2, '0')}:${(overlapStart % 60).toString().padStart(2, '0')}`,
        endTime: `${Math.floor(overlapEnd / 60).toString().padStart(2, '0')}:${(overlapEnd % 60).toString().padStart(2, '0')}`,
        hours: Math.round(hours * 10) / 10,
      });
    }
  }

  return { totalHours, sharedSlots };
}

function calcSkillScore(players) {
  const ranks = players.map((p) => SKILL_RANK[p.skill_level]);
  const range = Math.max(...ranks) - Math.min(...ranks);
  // 0 range = 40pts, 1 range = 25pts, 2 range = 10pts, 3 range = 0pts
  return Math.max(0, 40 - range * 15);
}

function buildGroups(players) {
  const groups = [];

  // Group by variant first
  const byVariant = {};
  for (const p of players) {
    if (!byVariant[p.variant]) byVariant[p.variant] = [];
    byVariant[p.variant].push(p);
  }

  for (const [variant, variantPlayers] of Object.entries(byVariant)) {
    if (variantPlayers.length < 4) continue;

    // Find all combinations of 4
    for (let i = 0; i < variantPlayers.length - 3; i++) {
      for (let j = i + 1; j < variantPlayers.length - 2; j++) {
        for (let k = j + 1; k < variantPlayers.length - 1; k++) {
          for (let l = k + 1; l < variantPlayers.length; l++) {
            const group = [variantPlayers[i], variantPlayers[j], variantPlayers[k], variantPlayers[l]];

            const skillScore = calcSkillScore(group);
            const { totalHours, sharedSlots } = calcAvailabilityOverlap(group);
            const availScore = Math.min(60, totalHours * 8);
            const totalScore = Math.round(skillScore + availScore);

            const ranks = group.map((p) => SKILL_RANK[p.skill_level]);
            const skillRange = Math.max(...ranks) - Math.min(...ranks);

            groups.push({
              players: group.map((p) => ({ ...p, availability: JSON.parse(p.availability) })),
              variant,
              score: totalScore,
              skill_score: skillScore,
              availability_score: Math.round(availScore),
              shared_slots: sharedSlots,
              skill_range: skillRange,
              skill_summary: describeSkillMix(group),
            });
          }
        }
      }
    }
  }

  return groups.sort((a, b) => b.score - a.score);
}

function describeSkillMix(players) {
  const counts = {};
  players.forEach((p) => {
    counts[p.skill_level] = (counts[p.skill_level] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([level, count]) => (count > 1 ? `${count}x ${level}` : level))
    .join(', ');
}

// GET /api/matchmaking - all suggested groups
router.get('/', (req, res) => {
  const { variant, limit = 20 } = req.query;

  let players = db.prepare('SELECT * FROM players').all();

  if (variant) {
    players = players.filter((p) => p.variant === variant);
  }

  const groups = buildGroups(players).slice(0, Number(limit));
  res.json({ groups, total: groups.length });
});

// GET /api/matchmaking/for/:playerId - groups for a specific player
router.get('/for/:playerId', (req, res) => {
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  // Get all players with the same variant
  const candidates = db
    .prepare('SELECT * FROM players WHERE variant = ? AND id != ?')
    .all(player.variant, player.id);

  if (candidates.length < 3) {
    return res.json({
      groups: [],
      message: `Not enough ${player.variant} players yet. Try browsing the directory to find others!`,
    });
  }

  // Build groups that include this player
  const allPlayers = [player, ...candidates];
  const allGroups = buildGroups(allPlayers);
  const myGroups = allGroups.filter((g) => g.players.some((p) => p.id === player.id));

  res.json({
    groups: myGroups.slice(0, 10),
    player: { ...player, availability: JSON.parse(player.availability) },
  });
});

module.exports = router;
