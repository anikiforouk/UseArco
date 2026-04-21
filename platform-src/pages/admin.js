import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import { IconLightning, IconFunding } from '../components/Icons';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function StatCard({ label, value, sub, color = 'amber' }) {
  const colors = {
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };
  return (
    <div className={`rounded-2xl border p-6 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-70 mb-1">{label}</p>
      <p className="text-4xl font-black">{value}</p>
      {sub && <p className="text-xs mt-2 opacity-60">{sub}</p>}
    </div>
  );
}

export default function Admin() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tab, setTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored || !token) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'supermaster') { router.push('/'); return; }
    setUser(u);
    fetchAll(token);
  }, []);

  const fetchAll = async (token) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, usersRes, projectsRes] = await Promise.all([
        fetch(`${API}/api/admin/stats`, { headers }),
        fetch(`${API}/api/admin/users?limit=100`, { headers }),
        fetch(`${API}/api/admin/projects?limit=100`, { headers })
      ]);
      if (statsRes.status === 403) { router.push('/'); return; }
      const [s, u, p] = await Promise.all([statsRes.json(), usersRes.json(), projectsRes.json()]);
      setStats(s);
      setUsers(u.users || []);
      setProjects(p.projects || []);
    } catch (err) {
      setError('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (userId, role) => {
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role })
    });
    fetchAll(token);
  };

  const deleteUser = async (userId, name) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/admin/users/${userId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    fetchAll(token);
  };

  const filteredUsers = users.filter(u =>
    !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.university?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const roleColors = { student: 'bg-blue-100 text-blue-700', mentor: 'bg-purple-100 text-purple-700', admin: 'bg-orange-100 text-orange-700', supermaster: 'bg-amber-200 text-amber-900' };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-amber-50 rounded-2xl flex items-center justify-center"><IconLightning size={24} className="text-amber-500" /></div>
        <p className="text-gray-500">Loading admin data...</p>
      </div>
    </div>
  );

  return (
    <>
      <Head><title>Admin Dashboard - useArco</title></Head>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">SUPERMASTER</span>
              </div>
              <p className="text-gray-400 text-sm">Full platform visibility and control</p>
            </div>
            <button onClick={() => fetchAll(localStorage.getItem('token'))}
              className="bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Refresh
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-700 rounded-xl p-4 mb-6 text-sm border border-red-200">{error}</div>}

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
            {['overview', 'users', 'projects', 'funding'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                  ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {tab === 'overview' && stats && (
            <div className="space-y-8">
              {/* Top stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={stats.totals.users} sub="All time" color="amber" />
                <StatCard label="Total Projects" value={stats.totals.projects} sub="All time" color="blue" />
                <StatCard label="Applications" value={stats.totals.applications} sub="All time" color="green" />
                <StatCard label="New This Week" value={stats.growth.newUsersWeek} sub={`${stats.growth.newProjectsWeek} new projects`} color="purple" />
              </div>

              {/* Growth */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">User Growth</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">This week</span>
                      <span className="font-bold text-gray-900">{stats.growth.newUsersWeek}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">This month</span>
                      <span className="font-bold text-gray-900">{stats.growth.newUsersMonth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">All time</span>
                      <span className="font-bold text-gray-900">{stats.totals.users}</span>
                    </div>
                  </div>
                </div>

                {/* Users by role */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Users by Role</h3>
                  <div className="space-y-3">
                    {stats.breakdown.usersByRole.map(r => (
                      <div key={r._id} className="flex justify-between items-center">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${roleColors[r._id] || 'bg-gray-100 text-gray-600'}`}>{r._id}</span>
                        <span className="font-bold text-gray-900">{r.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects by stage */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Projects by Stage</h3>
                  <div className="space-y-3">
                    {stats.breakdown.projectsByStage.map(s => (
                      <div key={s._id} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{s._id || 'Unknown'}</span>
                        <span className="font-bold text-gray-900">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Universities */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Top Universities</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-gray-400 font-medium">#</th>
                        <th className="text-left py-2 text-gray-400 font-medium">University</th>
                        <th className="text-right py-2 text-gray-400 font-medium">Users</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.breakdown.topUniversities.map((u, i) => (
                        <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2.5 text-gray-400">{i + 1}</td>
                          <td className="py-2.5 font-medium text-gray-900">{u._id}</td>
                          <td className="py-2.5 text-right font-bold text-amber-600">{u.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {tab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{users.length} Users</h2>
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search name, email, university..."
                  className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Name</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Email</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">University</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Major</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Role</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Joined</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u._id} className="border-t border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              {u.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{u.email}</td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{u.university}</td>
                          <td className="px-4 py-3 text-gray-500">{u.major}</td>
                          <td className="px-4 py-3">
                            <select value={u.role} onChange={e => changeRole(u._id, e.target.value)}
                              className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>
                              <option value="student">student</option>
                              <option value="mentor">mentor</option>
                              <option value="admin">admin</option>
                              <option value="supermaster">supermaster</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => deleteUser(u._id, u.name)}
                              className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {tab === 'projects' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">{projects.length} Projects</h2>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Title</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Owner</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">University</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Stage</th>
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map(p => (
                        <tr key={p._id} className="border-t border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{p.title}</td>
                          <td className="px-4 py-3 text-gray-600">{p.owner?.name}</td>
                          <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{p.university}</td>
                          <td className="px-4 py-3">
                            <span className="bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full font-medium">{p.stage}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* FUNDING TAB */}
          {tab === 'funding' && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-2xl flex items-center justify-center"><IconFunding size={32} className="text-amber-400" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Funding Tracker</h3>
              <p className="text-gray-400 max-w-sm mx-auto">Track investor contacts, funding rounds, and startup valuations across all university projects. Coming next sprint.</p>
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto opacity-40 pointer-events-none">
                <div className="bg-white rounded-xl border p-4 text-center">
                  <p className="text-2xl font-black text-gray-900">$0</p>
                  <p className="text-xs text-gray-400">Total Raised</p>
                </div>
                <div className="bg-white rounded-xl border p-4 text-center">
                  <p className="text-2xl font-black text-gray-900">0</p>
                  <p className="text-xs text-gray-400">Investors</p>
                </div>
                <div className="bg-white rounded-xl border p-4 text-center">
                  <p className="text-2xl font-black text-gray-900">0</p>
                  <p className="text-xs text-gray-400">Funded Projects</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
