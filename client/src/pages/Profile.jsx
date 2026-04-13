import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const VARIANTS = ['American', 'Japanese Riichi', 'Hong Kong', 'Chinese Classical'];

const SKILL_INFO = {
  Beginner:     { icon: '🌱', desc: 'Still learning the rules and basic strategies.' },
  Intermediate: { icon: '🎯', desc: 'Comfortable with rules, working on strategy.' },
  Advanced:     { icon: '⚡', desc: 'Strong strategic understanding, plays confidently.' },
  Expert:       { icon: '👑', desc: 'Deep mastery, can teach and play competitively.' },
};

const VARIANT_INFO = {
  'American':         { icon: '🇺🇸', desc: 'NMJL card, jokers, Charleston pass.' },
  'Japanese Riichi':  { icon: '🀄', desc: 'Yaku-based, riichi calls, tournaments.' },
  'Hong Kong':        { icon: '🏮', desc: 'Old Style, bonus tiles, fast play.' },
  'Chinese Classical':{ icon: '🐉', desc: 'Traditional scoring, flower tiles.' },
};

function AvailabilityPicker({ availability, onChange }) {
  const toggle = (day) => {
    const exists = availability.find((a) => a.day === day);
    if (exists) {
      onChange(availability.filter((a) => a.day !== day));
    } else {
      onChange([...availability, { day, startTime: '18:00', endTime: '22:00' }]);
    }
  };

  const updateTime = (day, field, value) => {
    onChange(availability.map((a) => (a.day === day ? { ...a, [field]: value } : a)));
  };

  const selected = (day) => availability.find((a) => a.day === day);

  return (
    <div className="space-y-2">
      {DAYS.map((day) => {
        const slot = selected(day);
        return (
          <div key={day} className="rounded-lg border border-slate-700 overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(day)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${
                slot
                  ? 'bg-jade-500/10 text-jade-400 border-b border-jade-500/20'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              <span>{day}</span>
              <span>{slot ? '✓ Available' : '+ Add'}</span>
            </button>
            {slot && (
              <div className="bg-slate-800/50 px-4 py-3 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">From</label>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateTime(day, 'startTime', e.target.value)}
                    className="input w-auto text-sm py-1 px-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">To</label>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateTime(day, 'endTime', e.target.value)}
                    className="input w-auto text-sm py-1 px-2"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    name: '',
    skill_level: 'Beginner',
    variant: 'American',
    availability: [],
    notes: '',
  });

  // Load existing profile
  useEffect(() => {
    const id = localStorage.getItem('mahjong_player_id');
    if (!id) return;
    fetch(`/api/players/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (p) {
          setForm({
            name: p.name,
            skill_level: p.skill_level,
            variant: p.variant,
            availability: p.availability,
            notes: p.notes || '',
          });
          setIsEditing(true);
        }
      })
      .catch(() => {});
  }, []);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target ? e.target.value : e }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (form.availability.length === 0) { setError('Please add at least one availability slot.'); return; }

    setSaving(true);
    try {
      const id = localStorage.getItem('mahjong_player_id');
      const url = isEditing ? `/api/players/${id}` : '/api/players';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save profile');
      }

      const player = await res.json();
      localStorage.setItem('mahjong_player_id', String(player.id));
      window.dispatchEvent(new Event('mahjong_profile_updated'));
      setIsEditing(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete your profile? This cannot be undone.')) return;
    const id = localStorage.getItem('mahjong_player_id');
    await fetch(`/api/players/${id}`, { method: 'DELETE' });
    localStorage.removeItem('mahjong_player_id');
    window.dispatchEvent(new Event('mahjong_profile_updated'));
    navigate('/');
  };

  return (
    <div className="page-enter max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title">{isEditing ? 'Edit Profile' : 'Create Profile'}</h1>
        <p className="section-subtitle">
          {isEditing
            ? 'Update your details to get better match suggestions.'
            : 'Set up your player profile to start finding matches.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-white text-sm uppercase tracking-wider text-slate-400">
            Basic Info
          </h2>
          <div>
            <label className="label">Display Name *</label>
            <input
              className="input"
              placeholder="e.g. Alice Chen"
              value={form.name}
              onChange={set('name')}
              maxLength={50}
            />
          </div>
          <div>
            <label className="label">Notes / Bio</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Tell others about yourself — your playing style, hosting situation, etc."
              value={form.notes}
              onChange={set('notes')}
              maxLength={300}
            />
            <p className="text-xs text-slate-500 mt-1 text-right">{form.notes.length}/300</p>
          </div>
        </div>

        {/* Skill Level */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-400">
            Skill Level *
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {SKILL_LEVELS.map((level) => {
              const { icon, desc } = SKILL_INFO[level];
              const active = form.skill_level === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, skill_level: level }))}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    active
                      ? 'border-jade-500 bg-jade-500/10 text-jade-400'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                  }`}
                >
                  <p className="font-semibold text-sm">
                    {icon} {level}
                  </p>
                  <p className="text-xs mt-0.5 opacity-75">{desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Variant */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-400">
            Preferred Variant *
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {VARIANTS.map((v) => {
              const { icon, desc } = VARIANT_INFO[v];
              const active = form.variant === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, variant: v }))}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    active
                      ? 'border-jade-500 bg-jade-500/10 text-jade-400'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                  }`}
                >
                  <p className="font-semibold text-sm">
                    {icon} {v}
                  </p>
                  <p className="text-xs mt-0.5 opacity-75">{desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Availability */}
        <div className="card space-y-3">
          <div>
            <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-400">
              Availability *
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select the days and times you're typically free to play.
            </p>
          </div>
          <AvailabilityPicker
            availability={form.availability}
            onChange={(val) => setForm((f) => ({ ...f, availability: val }))}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg px-4 py-3 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Saved */}
        {saved && (
          <div className="bg-jade-900/30 border border-jade-700 text-jade-400 rounded-lg px-4 py-3 text-sm">
            ✓ Profile saved successfully!
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={saving}>
            {saving ? '⏳ Saving…' : isEditing ? '💾 Save Changes' : '✨ Create Profile'}
          </button>
          {isEditing && (
            <button type="button" onClick={handleDelete} className="btn-danger">
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
