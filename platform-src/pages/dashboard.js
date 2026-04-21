import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api, { getToken } from '../lib/api';
import ProjectCard from '../components/ProjectCard';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalProjects: 0 });
  const [tab, setTab] = useState('projects');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { router.push('/login'); return; }
    Promise.all([
      api.get('/auth/me'),
      api.get('/stats'),
      api.get('/projects'),
    ]).then(([meRes, statsRes, projectsRes]) => {
      const me = meRes.data;
      setUser(me);
      setStats(statsRes.data || { totalUsers: 0, totalProjects: 0 });
      setMyProjects(projectsRes.data.filter(p =>
        p.owner?._id === me._id || p.owner === me._id
      ));
    }).catch(() => router.push('/login'))
    .finally(() => setLoading(false));
    api.get('/applications/mine').then(r => setMyApplications(r.data)).catch(() => {});
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-400 text-lg">Loading...</div>
    </div>
  );
  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name?.split(' ')[0]}</h1>
          <p className="text-gray-500 mt-1 capitalize">{user.role} &middot; {user.university}</p>
        </div>
        <Link href="/projects/new" className="btn-primary">+ Post Project</Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Members Signed Up', value: stats.totalUsers },
          { label: 'Projects Posted', value: stats.totalProjects },
          { label: 'Your Projects', value: myProjects.length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 text-center border border-gray-100 shadow-sm">
            <p className="text-3xl font-bold text-amber-600">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-8 border-b border-gray-200">
        {['projects', 'applications'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={pb-3 px-2 font-semibold capitalize transition-colors text-sm {
              tab === t ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-400 hover:text-gray-700'
            }}>{t}</button>
        ))}
      </div>

      {tab === 'projects' && (
        <div>
          {myProjects.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg mb-2">No projects posted yet.</p>
              <p className="text-sm mb-6">Start a project and find your co-founder.</p>
              <Link href="/projects/new" className="btn-primary">Post Your First Project</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myProjects.map(p => <ProjectCard key={p._id} project={p} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'applications' && (
        <div className="space-y-4">
          {myApplications.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="mb-4">No applications yet.</p>
              <Link href="/" className="text-amber-600 font-medium hover:underline">Browse projects</Link>
            </div>
          ) : myApplications.map(a => (
            <div key={a._id} className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-between p-5">
              <div>
                <p className="font-semibold text-gray-900">{a.project?.title || 'Project'}</p>
                <p className="text-gray-500 text-sm">{a.project?.category} - {a.project?.stage}</p>
              </div>
              <span className={text-sm font-semibold px-3 py-1 rounded-full {
                a.status === 'accepted' ? 'bg-green-100 text-green-700' :
                a.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600'
              }}>{a.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
