import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../lib/api';
import ProjectCard from '../components/ProjectCard';

export default function Dashboard({ user, setUser }) {
  const router = useRouter();
  const [myProjects, setMyProjects] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalProjects: 0 });
  const [tab, setTab] = useState('projects');
  const [loading, setLoading] = useState(true);

  // No need to check token - _app.js already fetched user
  // If user is null, redirect to login
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Fetch dashboard data
    Promise.all([
      api.get('/stats'),
      api.get('/projects?mine=true'),
      api.get('/applications')
    ])
      .then(([statsRes, projectsRes, appsRes]) => {
        setStats(statsRes.data);
        setMyProjects(projectsRes.data.projects || []);
        setMyApplications(appsRes.data.applications || []);
      })
      .catch((err) => {
        console.error('Dashboard load error:', err);
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          router.push('/login');
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (<div className="max-w-6xl mx-auto px-6 py-12 text-center text-gray-400">Loading dashboard...</div>);
  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name?.split(' ')[0]}</h1>
          <p className="text-gray-500 mt-1 capitalize">{user.role}{user.university ? ` · ${user.university}` : ''}</p>
        </div>
        <Link href="/projects/new" className="btn-primary">+ Post Project</Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalUsers}</div>
          <div className="text-gray-600 text-sm uppercase tracking-wide">Members Signed Up</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalProjects}</div>
          <div className="text-gray-600 text-sm uppercase tracking-wide">Projects Posted</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 mb-2">{myProjects.length}</div>
          <div className="text-gray-600 text-sm uppercase tracking-wide">Your Projects</div>
        </div>
      </div>

      {/* Tabs for Projects and Applications */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-4">
          {['projects', 'applications'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={'pb-3 px-2 font-semibold capitalize transition-colors text-sm ' +
                (tab === t ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-400 hover:text-gray-700')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'projects' ? (
        myProjects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-medium text-gray-600 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-4">Post your first project to find collaborators.</p>
            <Link href="/projects/new" className="btn-primary inline-block">Post a Project</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {myProjects.map(p => <ProjectCard key={p._id} project={p} />)}
          </div>
        )
      ) : (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Applications</h3>
          {myApplications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500">No applications yet. Browse projects and apply!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map(app => (
                <div key={app._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{app.project?.title || 'Untitled Project'}</h4>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 uppercase font-medium"
                      style={app.status === 'accepted' ? { backgroundColor: '#d1fae5', color: '#059669' } :
                             app.status === 'rejected' ? { backgroundColor: '#fee2e2', color: '#dc2626' } : {}}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                  <p className="text-gray-700 text-sm">{app.message || 'No message provided'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
