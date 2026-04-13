import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SKILL_BADGE = {
  Beginner:     'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Intermediate: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  Advanced:     'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  Expert:       'bg-amber-500/20 text-amber-400 border border-amber-500/30',
};

const VARIANT_ICONS = {
  'American': '🇺🇸',
  'Japanese Riichi': '🀄',
  'Hong Kong': '🏮',
  'Chinese Classical': '🐉',
};

function ScoreRing({ score }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#4ade80' : score >= 40 ? '#60a5fa' : '#f59e0b';

  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#334155" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white">{score}</span>
      </div>
    </div>
  );
}

function PlayerAvatar({ name, skillLevel, isCurrentUser }) {
  const initial = name.charAt(0).toUpperCase();
  const colors = {
    Beginner:     'from-emerald-600 to-emerald-800',
    Intermediate: 'from-blue-600 to-blue-800',
    Advanced:     'from-violet-600 to-violet-800',
    Expert:       'from-amber-600 to-amber-800',
  };
  return (
    <div className="flex flex-col items-center gap-1.5 text-center min-w-0">
      <div
        className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[skillLevel] ?? 'from-slate-600 to-slate-800'} flex items-center justify-center font-bold text-white text-sm ring-2 ${isCurrentUser ? 'ring-jade-400' : 'ring-slate-600'}`}
      >
        {initial}
      </div>
      <p className="text-xs text-slate-300 font-medium truncate w-full" title={name}>
        {name}
        {isCurrentUser && <span className="text-jade-400"> (you)</span>}
      </p>
      <span className={`badge text-xs ${SKILL_BADGE[skillLevel]}`}>{skillLevel}</span>
    </div>
  );
}

function GroupCard({ group, currentPlayerId, onJoinSession }) {
  const [creating, setCreating] = useState(false);
  const [done, setDone] = useState(false);

  const handleCreateSession = async () => {
    setCreating(true);
    try {
      const firstSlot = group.shared_slots[0];
      const today = new Date();
      // Find the next occurrence of the shared day
      const dayMap = { Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5,Saturday:6,Sunday:0 };
      const targetDay = dayMap[firstSlot?.day] ?? 6;
      const diff = (targetDay - today.getDay() + 7) % 7 || 7;
      const date = new Date(today);
      date.setDate(today.getDate() + diff);
      const [h, m] = (firstSlot?.startTime ?? '14:00').split(':');
      date.setHours(Number(h), Number(m), 0, 0);

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${group.variant} — Suggested Group`,
          date_time: date.toISOString(),
          variant: group.variant,
          skill_requirement: group.players[0].skill_level,
          max_players: 4,
          notes: `Auto-created from matchmaking. Players: ${group.players.map((p) => p.name).join(', ')}`,
          creator_id: currentPlayerId ? Number(currentPlayerId) : undefined,
        }),
      });
      if (res.ok) {
        setDone(true);
        onJoinSession?.();
      }
    } finally {
      setCreating(false);
    }
  };

  const hasMe = currentPlayerId && group.players.some((p) => p.id === Number(currentPlayerId));

  return (
    <div className={`card space-y-4 hover:border-slate-600 transition-all ${hasMe ? 'border-jade-500/40 bg-jade-900/10' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">{VARIANT_ICONS[group.variant]}</span>
            <h3 className="font-semibold text-white">{group.variant}</h3>
            {hasMe && (
              <span className="badge bg-jade-500/20 text-jade-400 border border-jade-500/30 text-xs">
                ✦ Your Match
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">{group.skill_summary}</p>
        </div>
        <ScoreRing score={group.score} />
      </div>

      {/* Players */}
      <div className="grid grid-cols-4 gap-2">
        {group.players.map((p) => (
          <PlayerAvatar
            key={p.id}
            name={p.name}
            skillLevel={p.skill_level}
            isCurrentUser={p.id === Number(currentPlayerId)}
          />
        ))}
      </div>

      {/* Score breakdown */}
      <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Compatibility</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${group.skill_score}%` }} />
          </div>
          <span className="text-xs text-slate-400 w-20 shrink-0">
            Skill: {group.skill_score}/40
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(group.availability_score / 60) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 w-20 shrink-0">
            Time: {group.availability_score}/60
          </span>
        </div>
      </div>

      {/* Shared slots */}
      {group.shared_slots.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Shared Availability
          </p>
          <div className="flex flex-wrap gap-1.5">
            {group.shared_slots.map((slot) => (
              <span
                key={slot.day}
                className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded-md"
              >
                {slot.day} {slot.startTime}–{slot.endTime}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action */}
      {done ? (
        <div className="flex items-center gap-2 text-jade-400 text-sm font-medium">
          ✓ Session created! <Link to="/sessions" className="underline">View in Sessions →</Link>
        </div>
      ) : (
        <button
          onClick={handleCreateSession}
          disabled={creating || !currentPlayerId}
          className="btn-primary w-full text-sm"
          title={!currentPlayerId ? 'Create a profile first' : ''}
        >
          {creating ? '⏳ Creating…' : '🎮 Create Session for This Group'}
        </button>
      )}
      {!currentPlayerId && (
        <p className="text-xs text-slate-500 text-center">
          <Link to="/profile" className="text-jade-400 underline">Create a profile</Link> to create sessions.
        </p>
      )}
    </div>
  );
}

const VARIANTS = ['All', 'American', 'Japanese Riichi', 'Hong Kong', 'Chinese Classical'];

export default function Matchmaking() {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [variantFilter, setVariantFilter] = useState('All');
  const [tab, setTab] = useState('all'); // 'all' | 'mine'
  const [message, setMessage] = useState('');
  const currentPlayerId = localStorage.getItem('mahjong_player_id');

  const loadGroups = () => {
    const url = variantFilter !== 'All'
      ? `/api/matchmaking?variant=${encodeURIComponent(variantFilter)}`
      : '/api/matchmaking';

    setLoading(true);
    Promise.all([
      fetch(url).then((r) => r.json()),
      currentPlayerId
        ? fetch(`/api/matchmaking/for/${currentPlayerId}`).then((r) => r.json())
        : Promise.resolve({ groups: [], message: '' }),
    ])
      .then(([allData, myData]) => {
        setGroups(allData.groups || []);
        setMyGroups(myData.groups || []);
        setMessage(myData.message || '');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadGroups(); }, [variantFilter]);

  const displayedGroups = tab === 'mine' ? myGroups : groups;

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Matchmaking</h1>
        <p className="section-subtitle">
          Groups of 4 auto-suggested by shared variant, skill level, and availability.
        </p>
      </div>

      {/* Algorithm explainer */}
      <div className="card bg-slate-800/50 flex flex-wrap gap-4 items-start p-4">
        <div className="text-2xl">⚙️</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white mb-1">How scoring works</p>
          <p className="text-xs text-slate-400">
            Each group is scored out of <strong className="text-slate-300">100 points</strong>:{' '}
            up to <strong className="text-violet-400">40pts for skill compatibility</strong> (same or adjacent
            levels score highest) and up to{' '}
            <strong className="text-blue-400">60pts for overlapping availability</strong> (more shared hours
            = higher score).
          </p>
        </div>
      </div>

      {/* Tabs & filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-1 gap-1">
          <button
            onClick={() => setTab('all')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === 'all' ? 'bg-jade-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Groups ({groups.length})
          </button>
          <button
            onClick={() => setTab('mine')}
            disabled={!currentPlayerId}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all disabled:opacity-40 ${
              tab === 'mine' ? 'bg-jade-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title={!currentPlayerId ? 'Create a profile first' : ''}
          >
            My Matches ({myGroups.length})
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 ml-auto">
          {VARIANTS.map((v) => (
            <button
              key={v}
              onClick={() => setVariantFilter(v)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                variantFilter === v
                  ? 'bg-jade-500 border-jade-500 text-white'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white bg-slate-800'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {!currentPlayerId && (
        <div className="card bg-amber-900/20 border-amber-700/30 flex items-center gap-3 py-3 px-4">
          <span className="text-xl">💡</span>
          <p className="text-sm text-amber-300">
            <Link to="/profile" className="underline font-semibold">Create a profile</Link> to see groups
            tailored specifically for you in the "My Matches" tab.
          </p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card h-64 animate-pulse bg-slate-800" />
          ))}
        </div>
      ) : displayedGroups.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">🀫</p>
          {message ? (
            <p className="text-slate-400 max-w-sm mx-auto">{message}</p>
          ) : (
            <p className="text-slate-400">
              {tab === 'mine'
                ? 'No matches found for your profile yet. Try inviting friends!'
                : 'No groups found for this variant filter.'}
            </p>
          )}
          <Link to="/players" className="btn-secondary mt-4 inline-flex">
            Browse Players
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedGroups.map((group, i) => (
            <GroupCard
              key={i}
              group={group}
              currentPlayerId={currentPlayerId}
              onJoinSession={loadGroups}
            />
          ))}
        </div>
      )}
    </div>
  );
}
