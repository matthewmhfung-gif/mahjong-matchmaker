import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const VARIANT_ICONS = {
  'American': '🇺🇸',
  'Japanese Riichi': '🀄',
  'Hong Kong': '🏮',
  'Chinese Classical': '🐉',
};

const SKILL_BADGE = {
  Beginner:     'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Intermediate: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  Advanced:     'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  Expert:       'bg-amber-500/20 text-amber-400 border border-amber-500/30',
};

function SessionCard({ session, currentPlayerId, onJoin }) {
  const isFull = session.seats_available === 0;
  const isJoined = session.players?.some((p) => p.id === Number(currentPlayerId));
  const pct = (session.seats_filled / session.max_players) * 100;

  const dateStr = new Date(session.date_time).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  const timeStr = new Date(session.date_time).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });

  return (
    <div className="card flex flex-col gap-3 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-white">{session.title}</h3>
          <p className="text-sm text-slate-400 mt-0.5">
            {VARIANT_ICONS[session.variant]} {session.variant}
          </p>
        </div>
        <span className={`badge shrink-0 ${SKILL_BADGE[session.skill_requirement] ?? 'bg-slate-600 text-slate-300'}`}>
          {session.skill_requirement}
        </span>
      </div>

      {session.location && (
        <p className="text-xs text-slate-400 truncate">📍 {session.location}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-slate-400">
        <span className="flex items-center gap-1">📅 {dateStr}</span>
        <span className="flex items-center gap-1">🕐 {timeStr}</span>
      </div>

      {/* Seat progress */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Seats filled</span>
          <span className={isFull ? 'text-amber-400 font-semibold' : 'text-jade-400 font-semibold'}>
            {session.seats_filled}/{session.max_players}
          </span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isFull ? 'bg-amber-400' : 'bg-jade-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <Link
        to="/sessions"
        className={`btn-primary text-sm w-full mt-1 ${isFull ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {isJoined ? '✓ Joined' : isFull ? 'Full' : 'View & Join'}
      </Link>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-jade-500/10 border border-jade-500/20 flex items-center justify-center text-2xl shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [sessions, setSessions] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const currentPlayerId = localStorage.getItem('mahjong_player_id');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('/api/sessions').then((r) => r.json()),
      fetch('/api/players').then((r) => r.json()),
    ])
      .then(([sess, players]) => {
        setSessions(sess);
        setPlayerCount(players.length);
      })
      .finally(() => setLoading(false));
  }, []);

  const openSessions = sessions.filter((s) => s.seats_available > 0);
  const fullSessions = sessions.filter((s) => s.seats_available === 0);

  return (
    <div className="page-enter space-y-10">
      {/* Hero */}
      <div className="text-center py-12 px-4">
        <div className="text-6xl mb-4 tile-glow">🀄</div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">
          Find Your Perfect <span className="text-jade-400">Table</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
          Match with players by skill, variant, and availability. Create sessions, join groups, and play more Mahjong.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/matchmaking" className="btn-primary px-6 py-3 text-base">
            🀄 Find a Match
          </Link>
          {!currentPlayerId && (
            <Link to="/profile" className="btn-secondary px-6 py-3 text-base">
              ✨ Create Profile
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon="👥" value={playerCount} label="Registered Players" />
        <StatCard icon="🎮" value={openSessions.length} label="Open Sessions" />
        <StatCard icon="✅" value={fullSessions.length} label="Full Tables" />
      </div>

      {/* Open Sessions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">Open Sessions</h2>
            <p className="section-subtitle">Games looking for players right now</p>
          </div>
          <Link to="/sessions" className="btn-secondary text-sm">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-44 animate-pulse bg-slate-800" />
            ))}
          </div>
        ) : openSessions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">🎲</p>
            <p className="text-slate-400 mb-4">No open sessions yet. Be the first!</p>
            <Link to="/sessions" className="btn-primary">
              Create a Session
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {openSessions.slice(0, 6).map((s) => (
              <SessionCard key={s.id} session={s} currentPlayerId={currentPlayerId} />
            ))}
          </div>
        )}
      </section>

      {/* Matchmaking CTA */}
      <section className="card bg-gradient-to-br from-jade-900/40 to-slate-800 border-jade-700/30 flex flex-col sm:flex-row items-center gap-6 py-8 px-6">
        <div className="text-5xl">🀄🀅🀆🀇</div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-xl font-bold text-white mb-1">Auto-Matchmaking</h2>
          <p className="text-slate-400 text-sm">
            Our algorithm groups players by variant, skill level, and shared availability — so you spend less time coordinating and more time playing.
          </p>
        </div>
        <Link to="/matchmaking" className="btn-primary shrink-0 px-6">
          Find Groups →
        </Link>
      </section>

      {/* Variant guide */}
      <section>
        <h2 className="section-title">Supported Variants</h2>
        <p className="section-subtitle">Register your preferred style of play</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { variant: 'American', desc: 'NMJL rules with jokers and Charleston pass. Great for beginners.', icon: '🇺🇸' },
            { variant: 'Japanese Riichi', desc: 'Yaku-based scoring with riichi declarations. Tournament standard.', icon: '🀄' },
            { variant: 'Hong Kong', desc: 'Fast-paced Old Style with bonus tiles and chicken hands.', icon: '🏮' },
            { variant: 'Chinese Classical', desc: 'Traditional rules with original scoring and flower tiles.', icon: '🐉' },
          ].map(({ variant, desc, icon }) => (
            <div key={variant} className="card hover:border-slate-600 transition-colors">
              <div className="text-3xl mb-2">{icon}</div>
              <h3 className="font-semibold text-white mb-1">{variant}</h3>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
