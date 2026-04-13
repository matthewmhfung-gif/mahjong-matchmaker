import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const SKILL_COLORS = {
  Beginner: 'text-emerald-400',
  Intermediate: 'text-blue-400',
  Advanced: 'text-violet-400',
  Expert: 'text-amber-400',
};

export default function Navbar() {
  const [player, setPlayer] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem('mahjong_player_id');
    if (!id) return;
    fetch(`/api/players/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => setPlayer(p))
      .catch(() => {});
  }, []);

  // Re-check when localStorage changes (e.g. after profile create)
  useEffect(() => {
    const handler = () => {
      const id = localStorage.getItem('mahjong_player_id');
      if (!id) { setPlayer(null); return; }
      fetch(`/api/players/${id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((p) => setPlayer(p))
        .catch(() => {});
    };
    window.addEventListener('mahjong_profile_updated', handler);
    return () => window.removeEventListener('mahjong_profile_updated', handler);
  }, []);

  const navItems = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/matchmaking', label: 'Matchmaking', icon: '🀄' },
    { to: '/sessions', label: 'Sessions', icon: '🎮' },
    { to: '/players', label: 'Players', icon: '👥' },
  ];

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl tile-glow">🀄</span>
            <span className="font-bold text-lg text-white hidden sm:block">
              Mahjong <span className="text-jade-400">Matchmaker</span>
            </span>
          </NavLink>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-jade-500/20 text-jade-400'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700'
                  }`
                }
              >
                <span>{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Player profile badge / CTA */}
          <div className="flex items-center gap-3">
            {player ? (
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 rounded-lg px-3 py-1.5 transition"
              >
                <div className="w-7 h-7 rounded-full bg-jade-500/20 border border-jade-500/40 flex items-center justify-center text-sm font-bold text-jade-400">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-none">{player.name}</p>
                  <p className={`text-xs leading-none mt-0.5 ${SKILL_COLORS[player.skill_level]}`}>
                    {player.skill_level}
                  </p>
                </div>
              </button>
            ) : (
              <NavLink to="/profile" className="btn-primary text-sm px-3 py-1.5">
                ✨ Create Profile
              </NavLink>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-700 py-2 space-y-1">
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full ${
                    isActive
                      ? 'bg-jade-500/20 text-jade-400'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700'
                  }`
                }
              >
                <span>{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
