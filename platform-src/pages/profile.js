import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { SKILLS } from '../lib/skills';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored || !token) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    setUser(u);
    setName(u.name || '');
    setMajor(u.major || '');
    setBio(u.bio || '');
    setSkills(u.skills || []);
    setLinkedinUrl(u.linkedinUrl || '');
    setGithubUrl(u.githubUrl || '');
    setGraduationYear(u.graduationYear || '');
  }, []);

  const handleSkillInput = (val) => {
    setSkillInput(val);
    if (val.length > 1) {
      const matches = SKILLS.filter(s => s.toLowerCase().includes(val.toLowerCase()) && !skills.includes(s)).slice(0, 6);
      setSkillSuggestions(matches);
    } else setSkillSuggestions([]);
  };

  const addSkill = (skill) => {
    if (!skills.includes(skill) && skills.length < 10) setSkills([...skills, skill]);
    setSkillInput(''); setSkillSuggestions([]);
  };

  const removeSkill = (s) => setSkills(skills.filter(x => x !== s));

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, major, bio, skills, linkedinUrl, githubUrl, graduationYear: graduationYear ? parseInt(graduationYear) : null })
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || 'Save failed.');
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      setError('Network error.');
    } finally { setSaving(false); }
  };

  if (!user) return null;

  const years = [];
  for (let y = 2025; y <= 2032; y++) years.push(y);

  return (
    <>
      <Head><title>Profile - useArco</title></Head>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-24 relative">
              <div className="absolute -bottom-8 left-8">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-2xl font-bold text-amber-500 border-4 border-white">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="pt-12 px-8 pb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-500 text-sm">{user.major} - {user.role}</p>
                  <p className="text-gray-400 text-sm">{user.university}</p>
                  {user.graduationYear && <p className="text-gray-400 text-xs mt-0.5">Class of {user.graduationYear}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {user.eduVerified && (
                    <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full border border-green-200 font-medium">
                      .edu verified
                    </span>
                  )}
                  <button onClick={() => setEditing(!editing)}
                    className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors
                      ${editing ? 'bg-gray-100 text-gray-600' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
                    {editing ? 'Cancel' : 'Edit profile'}
                  </button>
                </div>
              </div>

              {success && <div className="bg-green-50 text-green-700 rounded-lg p-3 text-sm mb-4 border border-green-200">{success}</div>}
              {error && <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm mb-4 border border-red-200">{error}</div>}

              {!editing ? (
                <div className="space-y-6">
                  {user.bio && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">About</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{user.bio}</p>
                    </div>
                  )}
                  {user.skills?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map(s => (
                          <span key={s} className="bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-full border border-amber-200">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(user.linkedinUrl || user.githubUrl) && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Links</h3>
                      <div className="flex gap-3">
                        {user.linkedinUrl && (
                          <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer"
                            className="text-blue-600 text-sm hover:underline">LinkedIn</a>
                        )}
                        {user.githubUrl && (
                          <a href={user.githubUrl} target="_blank" rel="noopener noreferrer"
                            className="text-gray-700 text-sm hover:underline">GitHub</a>
                        )}
                      </div>
                    </div>
                  )}
                  {!user.bio && !user.skills?.length && (
                    <p className="text-gray-400 text-sm text-center py-4">Complete your profile to attract better project matches.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                    <input value={name} onChange={e => setName(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Major</label>
                    <input value={major} onChange={e => setMajor(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio <span className="text-gray-400 text-xs">(optional, max 500 chars)</span></label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={500}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                      placeholder="Tell founders what you bring to the table..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Skills</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {skills.map(s => (
                        <span key={s} className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-full border border-amber-200">
                          {s} <button onClick={() => removeSkill(s)} className="text-amber-400 hover:text-red-500">&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="relative">
                      <input value={skillInput} onChange={e => handleSkillInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && skillInput.trim()) { e.preventDefault(); addSkill(skillInput.trim()); }}}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="Add a skill..." />
                      {skillSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                          {skillSuggestions.map(s => (
                            <button key={s} onClick={() => addSkill(s)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 hover:text-amber-700">{s}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn URL <span className="text-gray-400 text-xs">(optional)</span></label>
                      <input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="https://linkedin.com/in/..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">GitHub URL <span className="text-gray-400 text-xs">(optional)</span></label>
                      <input value={githubUrl} onChange={e => setGithubUrl(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="https://github.com/..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Graduation year <span className="text-gray-400 text-xs">(optional)</span></label>
                    <select value={graduationYear} onChange={e => setGraduationYear(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                      <option value="">Select year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <button onClick={handleSave} disabled={saving}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors">
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
