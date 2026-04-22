import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Simple demo page for professor presentation
export default function Demo({ user }) {
  const router = useRouter();
  
  const features = [
    { icon: '🏫', title: 'University-First Platform', desc: 'Exclusive .edu email registration ensures verified student and faculty access.' },
    { icon: '🤝', title: 'Project Matching', desc: 'Students find co-founders, mentors, and team members for startup ideas.' },
    { icon: '🎯', title: 'Skill-Based Filtering', desc: 'Match projects with collaborators based on 100+ technical and business skills.' },
    { icon: '🔒', title: 'Private University Ecosystems', desc: 'Each university has its own isolated ecosystem, fostering trust and local collaboration.' },
    { icon: '📈', title: 'Real-Time Analytics', desc: 'Track project growth, team formation, and university-wide engagement metrics.' },
    { icon: '👑', title: 'Supermaster Administration', desc: 'Universities can assign administrators to moderate and support their campus community.' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <Head>
        <title>useArco Demo | University Project Platform</title>
      </Head>
      
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">useArco Demo</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A university-first platform connecting students, faculty, and entrepreneurs to build the next generation of startups.
        </p>
        {user && (
          <p className="mt-4 text-lg text-amber-600 font-medium">
            👋 Welcome, {user.name}. You are logged in as {user.role}.
          </p>
        )}
      </div>

      <div className="mb-16 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-8 border border-amber-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Elevator Pitch</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          useArco solves the "co-founder gap" at universities by providing a structured, trusted environment for students to find collaborators, 
          mentors, and resources for their startup ideas. Unlike generic platforms like LinkedIn or Reddit, we enforce .edu verification, 
          creating exclusive ecosystems where each university can foster its own innovation community.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <button className="btn-primary" onClick={() => router.push('/projects/new')}>
            Try Creating a Project
          </button>
          <button className="btn-secondary" onClick={() => router.push('/')}>
            Browse Existing Projects
          </button>
          {user?.role === 'supermaster' && (
            <button className="btn-outline" onClick={() => router.push('/admin')}>
              View Admin Dashboard
            </button>
          )}
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb    -16">
        {features.map((f, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Live Demo Walkthrough</h2>
        <ol className="list-decimal pl-6 space-y-3 text-gray-700">
          <li><span className="font-medium">Student Registration</span> – Sign up with your .edu email (demo: try any .edu-like email).</li>
          <li><span className="font-medium">Browse Projects</span> – See projects filtered to your university (admin sees all).</li>
          <li><span className="font-medium">Post a Project</span> – Create a new startup idea with title, description, and needed skills.</li>
          <li><span className="font-medium">Apply to Projects</span> – Express interest in joining other students’ ventures.</li>
          <li><span className="font-medium">University Admin</span> – View platform analytics and moderate content (supermaster only).</li>
        </ol>
      </div>

      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>© 2026 useArco. For inquiries: hello@usearco.com</p>
      </div>
    </div>
  );
}
