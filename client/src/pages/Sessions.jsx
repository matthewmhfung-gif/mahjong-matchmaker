import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const SKILL_BADGE = {
  Beginner:     'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Intermediate: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  Advanced:     'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  Expert:       'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  Any:          'bg-slate-500/20 text-slate-300 border border-slate-500/30',
};

const VARIANT_ICONS = {
  'American': '🇺🇸',
  'Japanese Riichi': '🀄',
  'Hong Kong': '🏮',
  'Chinese Classical': '🐉',
};

const VARIANTS = ['American', 'Japanese Riichi', 'Hong Kong', 'Chinese Classical'];
const SKILL_LEVELS = ['Any', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

function formatDateTime(dt) {
  const d = new Date(dt);
  return {
    date: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    isPast: d < new Date(),
  };
}

function SessionDetailModal({ session, currentPlayerId, onClose, onUpdate }) {
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [note, setNote] = useState(session.notes || '');
  const [error, setError] = useState('');

  const isJoined = session.players?.some((p) => p.id === Number(currentPlayerId));
  const isFull = session.seats_available === 0;
  const { date, time, isPast } = formatDateTime(session.date_time);

  const handleJoin = async () => {
    if (!currentPlayerId) { setError('Create a profile first!'); return; }
    setJoining(true);
    setError('');
    try {
      const res = await fetch(`/api/sessions/${session.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: Number(currentPlayerId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdate(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Leave this session?')) return;
    setLeaving(true);
    setError('');
    try {
      const res = await fetch(`/api/sessions/${session.id}/leave`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: Number(currentPlayerId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdate(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-white">{session.title}</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {VARIANT_ICONS[session.variant]} {session.variant}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition p-1 rounded-lg hover:bg-slate-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Date</p>
              <p className="text-sm text-white font-medium">{date}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Time</p>
              <p className="text-sm text-white font-medium">{time}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Skill Level</p>
              <span className={`badge ${SKILL_BADGE[session.skill_requirement]}`}>
                {session.skill_requirement}
              </span>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Seats</p>
              <p className="text-sm font-bold">
                <span className={isFull ? 'text-amber-400' : 'text-jade-400'}>
                  {session.seats_filled}
                </span>
                <span className="text-slate-400">/{session.max_players} filled</span>
              </p>
            </div>
          </div>

          {/* Location */}
          {session.location && (
            <div className="bg-slate-900/50 rounded-lg p-3 flex items-start gap-2">
              <span className="text-base mt-0.5">📍</span>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Location</p>
                <p className="text-sm text-white">{session.location}</p>
              </div>
            </div>
          )}

          {/* Seat progress bar */}
          <div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isFull ? 'bg-amber-400' : 'bg-jade-500'
                }`}
                style={{ width: `${(session.seats_filled / session.max_players) * 100}%` }}
              />
            </div>
            {isFull && (
              <p className="text-xs text-amber-400 mt-1 font-medium">🎉 This table is full!</p>
            )}
          </div>

          {/* Players */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Players ({session.seats_filled}/{session.max_players})
            </p>
            <div className="space-y-2">
              {session.players?.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg ${
                    p.id === Number(currentPlayerId) ? 'bg-jade-500/10 border border-jade-500/20' : 'bg-slate-900/50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-jade-400">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {p.name}
                      {p.id === Number(currentPlayerId) && (
                        <span className="text-jade-400 text-xs ml-1">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">{p.skill_level}</p>
                  </div>
                </div>
              ))}
              {Array.from({ length: session.seats_available }).map((_, i) => (
                <div key={`empty-${i}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-900/30 border border-dashed border-slate-700">
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-600">
                    ?
                  </div>
                  <p className="text-sm text-slate-600 italic">Open seat</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {session.notes && (
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Notes</p>
              <p className="text-sm text-slate-300">{session.notes}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          {/* Action */}
          {!isPast && (
            <>
              {isJoined ? (
                <button onClick={handleLeave} disabled={leaving} className="btn-danger w-full">
                  {leaving ? '⏳ Leaving…' : '🚪 Leave Session'}
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={joining || isFull || !currentPlayerId}
                  className="btn-primary w-full"
                  title={!currentPlayerId ? 'Create a profile first' : ''}
                >
                  {joining ? '⏳ Joining…' : isFull ? '🈵 Session Full' : '🎮 Join Session'}
                </button>
              )}
              {!currentPlayerId && (
                <p className="text-xs text-center text-slate-500">
                  <Link to="/profile" className="text-jade-400 underline">Create a profile</Link> to join sessions.
                </p>
              )}
            </>
          )}
          {isPast && (
            <p className="text-sm text-slate-500 text-center">This session has already passed.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionCard({ session, onClick }) {
  const { date, time, isPast } = formatDateTime(session.date_time);
  const isFull = session.seats_available === 0;
  const pct = (session.seats_filled / session.max_players) * 100;

  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer hover:border-slate-500 transition-all active:scale-[0.99] ${isPast ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-white truncate">{session.title}</h3>
          <p className="text-sm text-slate-400 mt-0.5">
            {VARIANT_ICONS[session.variant]} {session.variant}
          </p>
        </div>
        <span className={`badge shrink-0 ${SKILL_BADGE[session.skill_requirement]}`}>
          {session.skill_requirement}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mb-3">
        <span>📅 {date}</span>
        <span>🕐 {time}</span>
        {session.location && <span className="w-full truncate">📍 {session.location}</span>}
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Seats</span>
          <span className={isFull ? 'text-amber-400 font-semibold' : 'text-jade-400 font-semibold'}>
            {session.seats_filled}/{session.max_players}
          </span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${isFull ? 'bg-amber-400' : 'bg-jade-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {isPast && (
        <p className="text-xs text-slate-500 mt-2 italic">Past session</p>
      )}
    </div>
  );
}

function CreateSessionModal({ currentPlayerId, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    date_time: '',
    variant: 'Hong Kong',
    skill_requirement: 'Any',
    max_players: 4,
    location: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date_time) { setError('Title and date/time are required.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          max_players: Number(form.max_players),
          creator_id: currentPlayerId ? Number(currentPlayerId) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated(data);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">Create Session</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Session Title *</label>
            <input className="input" placeholder="e.g. Friday Night Riichi" value={form.title} onChange={set('title')} />
          </div>
          <div>
            <label className="label">Date & Time *</label>
            <input className="input" type="datetime-local" value={form.date_time} onChange={set('date_time')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Variant *</label>
              <select className="input" value={form.variant} onChange={set('variant')}>
                {VARIANTS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Min. Skill</label>
              <select className="input" value={form.skill_requirement} onChange={set('skill_requirement')}>
                {SKILL_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Max Players</label>
            <select className="input" value={form.max_players} onChange={set('max_players')}>
              {[4].map((n) => <option key={n} value={n}>{n} (standard table)</option>)}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" placeholder="e.g. 123 Main St, Apt 2 or Community Center" value={form.location} onChange={set('location')} />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} placeholder="Rules, what to bring, parking info…" value={form.notes} onChange={set('notes')} />
          </div>

          {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2">⚠️ {error}</p>}

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? '⏳ Creating…' : '🎮 Create Session'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('open'); // 'open' | 'all'
  const [variantFilter, setVariantFilter] = useState('All');
  const currentPlayerId = localStorage.getItem('mahjong_player_id');

  const loadSessions = useCallback(() => {
    fetch('/api/sessions')
      .then((r) => r.json())
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadSessions(); }, []);

  const handleSessionUpdate = (updated) => {
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedSession(updated);
  };

  const handleSessionCreated = (newSession) => {
    setSessions((prev) => [newSession, ...prev]);
    setSelectedSession(newSession);
  };

  let displayed = sessions;
  if (filter === 'open') displayed = displayed.filter((s) => s.seats_available > 0 && new Date(s.date_time) >= new Date());
  if (variantFilter !== 'All') displayed = displayed.filter((s) => s.variant === variantFilter);

  // Open full session detail if clicked
  const openDetail = async (s) => {
    const res = await fetch(`/api/sessions/${s.id}`);
    const full = await res.json();
    setSelectedSession(full);
  };

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="section-title">Game Sessions</h1>
          <p className="section-subtitle">Browse open tables or create your own.</p>
        </div>
        <button
          onClick={() => {
            if (!currentPlayerId) {
              alert('Please create a profile first!');
              return;
            }
            setShowCreate(true);
          }}
          className="btn-primary"
        >
          + New Session
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-1 gap-1">
          <button
            onClick={() => setFilter('open')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'open' ? 'bg-jade-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Open
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-jade-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            All
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['All', ...VARIANTS].map((v) => (
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

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="card h-40 animate-pulse" />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">🎲</p>
          <p className="text-slate-400 mb-4">
            {filter === 'open' ? 'No open sessions right now.' : 'No sessions found.'}
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            Create the First Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((s) => (
            <SessionCard key={s.id} session={s} onClick={() => openDetail(s)} />
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          currentPlayerId={currentPlayerId}
          onClose={() => setSelectedSession(null)}
          onUpdate={handleSessionUpdate}
        />
      )}
      {showCreate && (
        <CreateSessionModal
          currentPlayerId={currentPlayerId}
          onClose={() => setShowCreate(false)}
          onCreated={handleSessionCreated}
        />
      )}
    </div>
  );
}
