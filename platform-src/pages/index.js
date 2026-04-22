import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import { IconRocket, IconAI, IconArrow, IconStar, IconProject, IconPeople } from '../components/Icons';
import api from '../lib/api';

const STAGES = ['All', 'Idea', 'Prototype', 'MVP', 'Beta', 'Live'];
const CATEGORIES = ['All', 'Tech', 'Social Impact', 'Health', 'Education', 'Finance', 'Creative', 'Other'];

export default function Home({ user, setUser }) {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('All');
  const [category, setCategory] = useState('All');
  const [showAll, setShowAll] = useState(false);
  const [total, setTotal] = useState(0);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user]);

  // Fetch projects when filters change
  useEffect(() => {
    if (!user) return;
    fetchProjects();
  }, [user, showAll, stage, category]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (showAll) params.append('all', 'true');
      if (stage !== 'All') params.append('stage', stage);
      if (category !== 'All') params.append('category', category);
      if (search) params.append('search', search);

      const res = await api.get(`/projects?${params}`);
      setProjects(res.data.projects || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      if (err.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // If not logged in, show nothing (will redirect)
  if (!user) return null;

  return (
    <div>
      <Head>
        <title>Browse Projects · useArco</title>
      </Head>
      <Navbar user={user} setUser={setUser} />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Find Your Next Project</h1>
            <p className="text-gray-500 mt-1">Discover student-led projects needing your skills.</p>
          </div>
          <Link href="/projects/new" className="btn-primary">+ Post a Project</Link>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="AI app, e-commerce, healthcare..."
                className="input w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchProjects()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
              <select className="input w-full" value={stage} onChange={(e) => setStage(e.target.value)}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select className="input w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <button
              onClick={fetchProjects}
              className="btn-primary flex items-center gap-2"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search Projects'}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show all universities</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showAll}
                  onChange={(e) => setShowAll(e.target.checked)}
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="text-gray-500 mt-4">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-medium text-gray-600 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or be the first to post a project.</p>
            <Link href="/projects/new" className="btn-primary inline-block">Post a Project</Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">Showing {projects.length} of {total} projects</p>
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map(project => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
