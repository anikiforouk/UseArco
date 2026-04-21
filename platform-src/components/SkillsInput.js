import { useState, useRef, useEffect } from 'react';
import SKILLS from '../lib/skills';

export default function SkillsInput({ selected = [], onChange, max = 10 }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = query.length < 1 ? [] : SKILLS.filter(
    s => s.toLowerCase().includes(query.toLowerCase()) && !selected.includes(s)
  ).slice(0, 8);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const add = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed || selected.length >= max || selected.includes(trimmed)) return;
    onChange([...selected, trimmed]);
    setQuery('');
    setOpen(false);
  };

  const remove = (skill) => onChange(selected.filter(s => s !== skill));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (filtered.length > 0) {
        add(filtered[0]);
      } else if (query.trim().length > 1) {
        add(query.trim());
      }
    }
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={ref} className="relative">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map(skill => (
            <span key={skill} className="skill-tag">
              {skill}
              <button onClick={() => remove(skill)} className="ml-1 hover:opacity-60" type="button">x</button>
            </span>
          ))}
        </div>
      )}

      {selected.length < max && (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selected.length === 0 ? 'Type to search skills - press Enter to add' : 'Add another skill...'}
            className="input"
          />
          {open && (filtered.length > 0 || query.trim().length > 1) && (
            <div className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              {filtered.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onMouseDown={() => add(skill)}
                  className="w-full text-left px-4 py-2.5 text-sm transition-all hover:opacity-80"
                  style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}
                >
                  {skill.split('').map((char, i) => {
                    const idx = skill.toLowerCase().indexOf(query.toLowerCase());
                    const inMatch = idx >= 0 && i >= idx && i < idx + query.length;
                    return inMatch
                      ? <mark key={i} style={{ background: 'rgba(245,158,11,0.3)', color: 'inherit', borderRadius: '2px' }}>{char}</mark>
                      : char;
                  })}
                </button>
              ))}
              {filtered.length === 0 && query.trim().length > 1 && (
                <button
                  type="button"
                  onMouseDown={() => add(query.trim())}
                  className="w-full text-left px-4 py-2.5 text-sm"
                  style={{ color: 'var(--accent)', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}
                >
                  + Add "{query.trim()}" as custom skill
                </button>
              )}
            </div>
          )}
        </div>
      )}
      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
        {selected.length}/{max} skills - press Enter or click to add
      </p>
    </div>
  );
}
