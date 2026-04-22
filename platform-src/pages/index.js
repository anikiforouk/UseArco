import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import { IconRocket, IconAI, IconArrow, IconStar, IconProject, IconPeople } from '../components/Icons';

const STAGES = ['All', 'Idea', 'Prototype', 'MVP', 'Beta', 'Live'];
const CATEGORIES = ['All', 'Tech', 'Social Impact', 'Health', 'Education', 'Finance', 'Creative', 'Other'];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('All');
  const [category, setCategory] = useState('All');
  const [showAll, setShowAll] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored || !token) { router.push('/login'); return; }
    setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchProjects();
  }, [user, showAll, stage, category]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const params = new URLSearchParams();
      if (showAll) params.append('all', 'true');
      if (stage !== 'All') params.append('stage', stage);
      if (category !== 'All') params.append('category', category);
      if (search) params.append('search', search);

      const res = await fetch(`${API}/api/projects?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      setProjects(data.projects || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  if (!user) return null;

  return (
    <>
      <Head><title>useArco - Find Your Co-Founder</title></Head>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />

        {/* Pro Plan Teaser Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-400">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-1.5">
                <IconAI size={16} className="text-white" />
              </div>
              <p className="text-white text-sm font-medium">
                <span className="font-bold">Arco AI Co-Founder</span> is coming to Pro -
                an AI advisor that breaks down your roadmap, matches you with the right people, and runs weekly check-ins.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">Pro Plan</span>
              <IconArrow size={16} className="text-white/70" />
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Find your <span className="text-amber-500">co-founder</span> at {user.university?.split(' ')?.slice(0,2)?.join(' ') || 'your university'}
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
              Browse projects from your university. Apply to collaborate. Build something real.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-6">
              <div className="flex gap-2">
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search projects, skills, ideas..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors">
                  Search
                </button>
              </div>
            </form>

            {/* University toggle */}
            <div className="inline-flex bg-gray-100 rounded-xl p-1 mb-2">
              <button onClick={() => setShowAll(false)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors
                  ${!showAll ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                My University
              </button>
              <button onClick={() => setShowAll(true)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors
                  ${showAll ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                All Universities
              </button>
            </div>
          </div>
        </div>

        {/* Filters + Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Filter row */}
          <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {STAGES.map(s => (
                <button key={s} onClick={() => setStage(s)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
                    ${stage === s ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <Link href="/projects/new"
                className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                + Post project
              </Link>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-400 mb-5">
            {loading ? 'Loading...' : `${total} project${total !== 1 ? 's' : ''} ${showAll ? 'across all universities' : `at ${user.university.split(' ').slice(0,3).join(' ')}`}`}
          </p>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-6 bg-amber-50 rounded-2xl flex items-center justify-center">
                <IconRocket size={32} className="text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {showAll ? 'No projects found' : 'No projects at your university yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {showAll ? 'Try adjusting your filters.' : 'Be the first to post a project at your university.'}
              </p>
              <Link href="/projects/new"
                className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-3 rounded-xl transition-colors">
                Post the first project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(p => <ProjectCard key={p._id} project={p} />)}
            </div>
          )}

          {/* Pro Plan Feature Card */}
          <div className="mt-16 bg-white rounded-2xl border border-amber-100 p-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-bold px-4 py-2 rounded-full border border-amber-200 mb-5">
                <IconStar size={14} />
                Coming Soon - Pro Plan
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Meet your AI Co-Founder
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Arco AI joins your project as an always-available co-founder.
                It breaks down your idea into a week-by-week roadmap, recommends collaborators
                based on what your project actually needs, and runs automated check-ins to keep the team on track.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {[
                  { icon: <IconProject size={20} className="text-amber-500" />, title: 'Smart Roadmap', desc: 'AI breaks your project into milestones and assigns tasks automatically' },
                  { icon: <IconPeople size={20} className="text-amber-500" />, title: 'Co-Founder Matching', desc: 'AI analyzes your project and recommends the right people from your university' },
                  { icon: <IconAI size={20} className="text-amber-500" />, title: 'Weekly Check-ins', desc: 'Automated standups keep the team aligned without the overhead' },
                ].map((f, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <div className="mb-3">{f.icon}</div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">{f.title}</p>
                    <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className='border-t border-gray-100 mt-16 py-8'>        <div className='max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4'>          <p className='text-sm text-gray-400'>2026 useArco. All rights reserved.</p>          <div className='flex items-center gap-6'>            <a href='/about' className='text-sm text-gray-400 hover:text-amber-600 transition-colors'>About</a>            <a href='/privacy' className='text-sm text-gray-400 hover:text-amber-600 transition-colors'>Privacy Policy</a>            <a href='/terms' className='text-sm text-gray-400 hover:text-amber-600 transition-colors'>Terms of Service</a>            <a href='mailto:hello@usearco.com' className='text-sm text-gray-400 hover:text-amber-600 transition-colors'>Contact</a>          </div>        </div>      </footer>
    </>
      
  );
}
