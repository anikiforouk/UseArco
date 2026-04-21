import { useState } from 'react';
import { useRouter } from 'next/router';
import api, { getToken } from '../../lib/api';

const CATEGORIES = ['tech', 'real-estate', 'ecommerce', 'saas', 'content', 'other'];
const STAGES = ['idea', 'mvp', 'launched', 'scaling'];

export default function NewProject() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', category: 'tech', stage: 'idea', skillsNeeded: '', equity: 'Negotiable', compensation: 'Equity only' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!getToken()) { router.push('/login'); return; }
    setLoading(true); setError('');
    try {
      const payload = { ...form, skillsNeeded: form.skillsNeeded.split(',').map(s => s.trim()).filter(Boolean) };
      const { data } = await api.post('/projects', payload);
      router.push(`/projects/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">Post a Project</h1>
      <p className="text-slate-400 mb-8">Tell collaborators what you're building and who you need.</p>
      {error && <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-slate-300 text-sm mb-2 block">Project Title *</label>
          <input className="input" placeholder="e.g. AI-powered rental management app" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
        </div>
        <div>
          <label className="text-slate-300 text-sm mb-2 block">Description *</label>
          <textarea className="input min-h-32" placeholder="Describe your project, the problem it solves, and what you've built so far..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Category</label>
            <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Stage</label>
            <select className="input" value={form.stage} onChange={e => setForm({...form, stage: e.target.value})}>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-slate-300 text-sm mb-2 block">Skills Needed (comma separated)</label>
          <input className="input" placeholder="e.g. React, Node.js, Marketing" value={form.skillsNeeded} onChange={e => setForm({...form, skillsNeeded: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Equity Offer</label>
            <input className="input" placeholder="e.g. 10-20%" value={form.equity} onChange={e => setForm({...form, equity: e.target.value})} />
          </div>
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Compensation</label>
            <input className="input" placeholder="e.g. Equity only" value={form.compensation} onChange={e => setForm({...form, compensation: e.target.value})} />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Posting...' : 'Post Project'}</button>
      </form>
    </div>
  );
}
