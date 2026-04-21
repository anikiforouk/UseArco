import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api, { getToken } from '../../lib/api';

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState(null);
  const [message, setMessage] = useState('');
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) api.get(`/projects/${id}`).then(r => setProject(r.data));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!getToken()) { router.push('/login'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/applications', { projectId: id, message });
      setApplied(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply');
    } finally { setLoading(false); }
  };

  if (!project) return <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}><div className='text-center py-20' style={{ color: 'var(--text-secondary)' }}>Loading...</div></div>;

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <Link href={'workspace'.replace('workspace', id + '/workspace')} className="btn-primary text-sm" style={{ textDecoration: 'none' }}>Open Workspace</Link>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs bg-amber-900 text-amber-300 px-3 py-1 rounded-full font-semibold">{project.stage}</span>
            <span className="text-xs text-slate-400">{project.category}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${ project.status === 'open' ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'}`}>{project.status}</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">{project.title}</h1>
          <p className="text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap">{project.description}</p>
          {project.skillsNeeded?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Skills Needed</h3>
              <div className="flex flex-wrap gap-2">
                {project.skillsNeeded.map(s => <span key={s} className="bg-slate-700 text-slate-300 text-sm px-3 py-1 rounded">{s}</span>)}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 p-4 bg-navy-light rounded-xl mb-6">
            <div><p className="text-slate-400 text-sm">Equity</p><p className="text-amber-400 font-bold">{project.equity}</p></div>
            <div><p className="text-slate-400 text-sm">Compensation</p><p className="text-white font-semibold">{project.compensation}</p></div>
          </div>
        </div>

        <div>
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-4">
            <Link href={'workspace'.replace('workspace', id + '/workspace')} className="btn-primary text-sm" style={{ textDecoration: 'none' }}>Open Workspace</Link>
          </div>
          <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xl">
                {project.owner?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold">{project.owner?.name}</p>
                <p className="text-slate-400 text-sm capitalize">{project.owner?.role}</p>
              </div>
            </div>
            {project.owner?.bio && <p className="text-slate-400 text-sm mb-4">{project.owner.bio}</p>}
            <div className="flex gap-3">
              {project.owner?.linkedin && <a href={project.owner.linkedin} target="_blank" className="text-amber-400 text-sm hover:underline">LinkedIn</a>}
              {project.owner?.github && <a href={project.owner.github} target="_blank" className="text-amber-400 text-sm hover:underline">GitHub</a>}
            </div>
          </div>

          {project.status === 'open' && (
            <div className="card">
              {applied ? (
                <div className="text-center">
                  <p className="text-green-400 font-semibold text-lg mb-2">Application sent!</p>
                  <p className="text-slate-400 text-sm">The project owner will review your message.</p>
                </div>
              ) : (
                <form onSubmit={handleApply}>
                  <h3 className="text-white font-bold mb-3">Apply to collaborate</h3>
                  {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
                  <textarea
                    className="input min-h-28 mb-4"
                    placeholder="Introduce yourself and explain why you'd be a great fit..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary w-full" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Application'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
      </div>
  );
}