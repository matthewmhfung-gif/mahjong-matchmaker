import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SKILL_BADGE = {
  Beginner:     'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Intermediate: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  Advanced:     'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  Expert:       'bg-amber-500/20 text-amber-400 border border-amber-500/30',
};

const SKILL_GRADIENT = {
  Beginner:     'from-emerald-700 to-emerald-900',
  Intermediate: 'from-blue-700 to-blue-900',
  Advanced:     'from-violet-700 to-violet-900',
  Expert:       'from-amber-700 to-amber-900',
};

const VARIANT_ICONS = {
  'American': '🇺🇸',
  'Japanese Riichi': '🀄',
  'Hong Kong': '🏮',
  'Chinese Classical': '🐉',
};

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const VARIANTS = ['American', 'Japanese Riichi', 'Hong Kong', 'Chinese Classical'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function AvailabilityDots({ availability }) {
  const dayAbbr = { Monday:'M', Tuesday:'T', Wednesday:'W', Thursday:'T', Friday:'F', Saturday:'S', Sunday:'S' };
  return (
    <div className="flex gap-1">
      {DAYS.map((day) => {
        const active = availability.some((a) => a.day === day);
        return (
          <div
            key={day}
            title={day}
            className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs font-bold transition-colors ${
              active ? 'bg-jade-500/30 text-jade-400' : 'bg-slate-700 text-slate-600'
            }`}
          >
            {dayAbbr[day]}
          </div>
        );
      })}
    </div>
  );
}

function PlayerCard({ player, isCurrentUser }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`card hover:border-slate-600 transition-all cursor-pointer ${
        isCurrentUser ? 'border-jade-500/40 bg-jade-900/10' : ''
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${SKILL_GRADIENT[player.skill_level]} flex items-center justify-center font-bold text-white text-lg shrink-0`}
        >
          {player.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white">
              {player.name}
              {isCurrentUser && <span className="text-jade-400 text-sm ml-1">(you)</span>}
            </h3>
            <span className={`badge text-xs ${SKILL_BADGE[player.skill_level]}`}>
              {player.skill_level}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            {VARIANT_ICONS[player.variant]} {player.variant}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-slate-500 shrink-0 mt-1 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Availability dots */}
      <div className="mt-3">
        <p className="text-xs text-slate-500 mb-1.5">Availability</p>
        <AvailabilityDots availability={player.availability} />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-700 space-y-3 text-sm">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Schedule</p>
            <div className="space-y-1">
              {player.availability.length === 0 ? (
                <p className="text-slate-500 italic text-xs">No availability set.</p>
              ) : (
                player.availability.map((slot) => (
                  <div key={slot.day} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium w-24">{slot.day}</span>
                    <span className="text-slate-400">
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          {player.notes && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-slate-300 text-sm">{player.notes}</p>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Member since {new Date(player.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlayerDirectory() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [variantFilter, setVariantFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const currentPlayerId = localStorage.getItem('mahjong_player_id');

  useEffect(() => {
    const params = new URLSearchParams();
    if (skillFilter) params.set('skill_level', skillFilter);
    if (variantFilter) params.set('variant', variantFilter);
    if (search) params.set('search', search);

    fetch(`/api/players?${params}`)
      .then((r) => r.json())
      .then(setPlayers)
      .finally(() => setLoading(false));
  }, [skillFilter, variantFilter, search]);

  // Client-side day filter
  const displayed = dayFilter
    ? players.filter((p) => p.availability.some((a) => a.day === dayFilter))
    : players;

  const hasFilters = skillFilter || variantFilter || search || dayFilter;

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Player Directory</h1>
        <p className="section-subtitle">
          Browse all {players.length} registered players. Click a card to expand their schedule.
        </p>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter Players</p>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="input pl-9"
            placeholder="Search by name or notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Skill filter chips */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Skill Level</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSkillFilter('')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                !skillFilter ? 'bg-jade-500 border-jade-500 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white bg-slate-800'
              }`}
            >
              All
            </button>
            {SKILL_LEVELS.map((s) => (
              <button
                key={s}
                onClick={() => setSkillFilter(skillFilter === s ? '' : s)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  skillFilter === s
                    ? 'bg-jade-500 border-jade-500 text-white'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Variant filter chips */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Variant</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setVariantFilter('')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                !variantFilter ? 'bg-jade-500 border-jade-500 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white bg-slate-800'
              }`}
            >
              All
            </button>
            {VARIANTS.map((v) => (
              <button
                key={v}
                onClick={() => setVariantFilter(variantFilter === v ? '' : v)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  variantFilter === v
                    ? 'bg-jade-500 border-jade-500 text-white'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white bg-slate-800'
                }`}
              >
                {VARIANT_ICONS[v]} {v}
              </button>
            ))}
          </div>
        </div>

        {/* Day filter */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Available On</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setDayFilter('')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                !dayFilter ? 'bg-jade-500 border-jade-500 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white bg-slate-800'
              }`}
            >
              Any Day
            </button>
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setDayFilter(dayFilter === d ? '' : d)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  dayFilter === d
                    ? 'bg-jade-500 border-jade-500 text-white'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white bg-slate-800'
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setSkillFilter(''); setVariantFilter(''); setDayFilter(''); }}
            className="text-xs text-slate-400 hover:text-white underline transition"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-slate-400">
          Showing <span className="text-white font-semibold">{displayed.length}</span> player{displayed.length !== 1 ? 's' : ''}
          {hasFilters && ' matching your filters'}
        </p>
      )}

      {/* Player grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="card h-36 animate-pulse" />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-slate-400 mb-4">No players match your filters.</p>
          <button
            onClick={() => { setSearch(''); setSkillFilter(''); setVariantFilter(''); setDayFilter(''); }}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              isCurrentUser={p.id === Number(currentPlayerId)}
            />
          ))}
        </div>
      )}

      {/* CTA for non-registered users */}
      {!currentPlayerId && (
        <div className="card bg-gradient-to-br from-jade-900/30 to-slate-800 border-jade-700/30 text-center py-8">
          <p className="text-xl mb-2">👋</p>
          <p className="text-white font-semibold mb-1">Join the community</p>
          <p className="text-slate-400 text-sm mb-4">Create your profile to appear in the directory and start matchmaking.</p>
          <Link to="/profile" className="btn-primary">
            ✨ Create Profile
          </Link>
        </div>
      )}
    </div>
  );
}
