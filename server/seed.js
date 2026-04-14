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

const seedSessions = [];

function seed() {
  // No demo data — all players and sessions are created by real users
  console.log('Database ready.');
}

module.exports = { seed };
