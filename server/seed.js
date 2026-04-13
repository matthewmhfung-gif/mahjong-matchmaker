const db = require('./db');

const seedPlayers = [
  {
    name: 'Alice Chen',
    skill_level: 'Intermediate',
    variant: 'Hong Kong',
    availability: JSON.stringify([
      { day: 'Saturday', startTime: '14:00', endTime: '20:00' },
      { day: 'Sunday', startTime: '10:00', endTime: '18:00' },
    ]),
    notes: 'Love playing weekends! Prefer afternoon sessions.',
  },
  {
    name: 'Bob Tanaka',
    skill_level: 'Advanced',
    variant: 'Japanese Riichi',
    availability: JSON.stringify([
      { day: 'Friday', startTime: '18:00', endTime: '23:00' },
      { day: 'Saturday', startTime: '12:00', endTime: '22:00' },
    ]),
    notes: 'Been playing Riichi for 5 years. Happy to teach advanced concepts.',
  },
  {
    name: 'Carol Wu',
    skill_level: 'Beginner',
    variant: 'American',
    availability: JSON.stringify([
      { day: 'Monday', startTime: '19:00', endTime: '22:00' },
      { day: 'Wednesday', startTime: '19:00', endTime: '22:00' },
      { day: 'Friday', startTime: '18:00', endTime: '22:00' },
    ]),
    notes: 'Just starting out! Patient teachers appreciated.',
  },
  {
    name: 'David Park',
    skill_level: 'Advanced',
    variant: 'Japanese Riichi',
    availability: JSON.stringify([
      { day: 'Saturday', startTime: '10:00', endTime: '20:00' },
      { day: 'Sunday', startTime: '12:00', endTime: '18:00' },
    ]),
    notes: 'Competitive player, enjoy casual games too.',
  },
  {
    name: 'Emma Rodriguez',
    skill_level: 'Intermediate',
    variant: 'Hong Kong',
    availability: JSON.stringify([
      { day: 'Tuesday', startTime: '19:00', endTime: '22:00' },
      { day: 'Thursday', startTime: '19:00', endTime: '22:00' },
      { day: 'Saturday', startTime: '13:00', endTime: '19:00' },
    ]),
    notes: 'Grew up playing with family. Looking for regular group.',
  },
  {
    name: 'Frank Li',
    skill_level: 'Expert',
    variant: 'Chinese Classical',
    availability: JSON.stringify([
      { day: 'Saturday', startTime: '09:00', endTime: '17:00' },
      { day: 'Sunday', startTime: '09:00', endTime: '17:00' },
    ]),
    notes: 'Traditional rules only. Can host at my place.',
  },
  {
    name: 'Grace Kim',
    skill_level: 'Beginner',
    variant: 'American',
    availability: JSON.stringify([
      { day: 'Monday', startTime: '18:00', endTime: '22:00' },
      { day: 'Wednesday', startTime: '18:00', endTime: '22:00' },
      { day: 'Saturday', startTime: '10:00', endTime: '14:00' },
    ]),
    notes: 'Learned from my grandmother. Still getting the hang of it!',
  },
  {
    name: 'Henry Zhou',
    skill_level: 'Intermediate',
    variant: 'Japanese Riichi',
    availability: JSON.stringify([
      { day: 'Friday', startTime: '19:00', endTime: '23:00' },
      { day: 'Saturday', startTime: '15:00', endTime: '22:00' },
    ]),
    notes: 'Switched from Hong Kong style last year. Still learning Riichi nuances.',
  },
  {
    name: 'Isabel Ng',
    skill_level: 'Advanced',
    variant: 'Hong Kong',
    availability: JSON.stringify([
      { day: 'Saturday', startTime: '13:00', endTime: '20:00' },
      { day: 'Sunday', startTime: '11:00', endTime: '17:00' },
    ]),
    notes: 'Fast player, prefer games that move at a good pace.',
  },
  {
    name: 'James Wong',
    skill_level: 'Expert',
    variant: 'Chinese Classical',
    availability: JSON.stringify([
      { day: 'Friday', startTime: '20:00', endTime: '23:59' },
      { day: 'Saturday', startTime: '10:00', endTime: '22:00' },
      { day: 'Sunday', startTime: '10:00', endTime: '20:00' },
    ]),
    notes: 'Mahjong instructor on weekdays. Available most weekends.',
  },
  {
    name: 'Li Wei',
    skill_level: 'Intermediate',
    variant: 'Hong Kong',
    availability: JSON.stringify([
      { day: 'Saturday', startTime: '13:00', endTime: '20:00' },
      { day: 'Sunday', startTime: '12:00', endTime: '18:00' },
    ]),
    notes: 'Recently moved to the area and looking for a regular group!',
  },
  {
    name: 'Yuki Matsumoto',
    skill_level: 'Intermediate',
    variant: 'Japanese Riichi',
    availability: JSON.stringify([
      { day: 'Friday', startTime: '18:00', endTime: '23:00' },
      { day: 'Saturday', startTime: '14:00', endTime: '22:00' },
    ]),
    notes: 'Learned in Japan, enjoy both casual and competitive games.',
  },
];

const seedSessions = [
  {
    title: 'Weekend Hong Kong Social',
    date_time: '2026-04-18T14:00:00',
    variant: 'Hong Kong',
    skill_requirement: 'Intermediate',
    max_players: 4,
    location: 'Chinatown Community Center, Room 2B',
    notes: 'Casual game, bring snacks!',
  },
  {
    title: 'Riichi Friday Night',
    date_time: '2026-04-17T19:00:00',
    variant: 'Japanese Riichi',
    skill_requirement: 'Advanced',
    max_players: 4,
    location: "Bob's apartment — 12 Maple St, Apt 4F",
    notes: 'Serious game, Tenhou rules. BYO drinks.',
  },
  {
    title: "Beginner's American Mahjong",
    date_time: '2026-04-19T13:00:00',
    variant: 'American',
    skill_requirement: 'Beginner',
    max_players: 4,
    location: 'Sunnyvale Public Library, Meeting Room A',
    notes: 'All skill levels welcome. We will go slow and explain rules as we go.',
  },
];

function seed() {
  const playerCount = db.prepare('SELECT COUNT(*) as count FROM players').get();

  if (playerCount.count > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database with demo data...');

  const insertPlayer = db.prepare(
    'INSERT INTO players (name, skill_level, variant, availability, notes) VALUES (?, ?, ?, ?, ?)'
  );

  const insertSession = db.prepare(
    'INSERT INTO sessions (title, date_time, variant, skill_requirement, max_players, location, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const insertSessionPlayer = db.prepare(
    'INSERT INTO session_players (session_id, player_id) VALUES (?, ?)'
  );

  db.exec('BEGIN');
  try {
    const playerIds = seedPlayers.map(
      (p) => insertPlayer.run(p.name, p.skill_level, p.variant, p.availability, p.notes).lastInsertRowid
    );

    const sessionIds = seedSessions.map(
      (s) => insertSession.run(s.title, s.date_time, s.variant, s.skill_requirement, s.max_players, s.location || '', s.notes).lastInsertRowid
    );

    // Alice and Emma join the Hong Kong session
    insertSessionPlayer.run(sessionIds[0], playerIds[0]);
    insertSessionPlayer.run(sessionIds[0], playerIds[4]);
    // Bob joins the Riichi session
    insertSessionPlayer.run(sessionIds[1], playerIds[1]);
    // Carol joins the Beginner session
    insertSessionPlayer.run(sessionIds[2], playerIds[2]);

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  console.log(`Seeded ${seedPlayers.length} players and ${seedSessions.length} sessions.`);
}

module.exports = { seed };
