import Navbar from '../components/Navbar';
export default function About({ user }) {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar user={user} />
      <div className='max-w-3xl mx-auto px-6 py-16'>
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>About useArco</h1>
        <p className='text-lg text-gray-500 mb-10'>useArco is a university-exclusive platform connecting students, founders and researchers with verified collaborators.</p>
        <div className='grid md:grid-cols-2 gap-8 mb-12'>
          <div className='bg-white rounded-2xl border border-gray-100 p-6'><h2 className='text-lg font-bold text-gray-900 mb-2'>Our Mission</h2><p className='text-gray-500 text-sm leading-relaxed'>Every great startup begins with the right team. useArco bridges the gap between ambitious students with ideas and talented collaborators - within the trusted network of their university.</p></div>
          <div className='bg-white rounded-2xl border border-gray-100 p-6'><h2 className='text-lg font-bold text-gray-900 mb-2'>Why University-First</h2><p className='text-gray-500 text-sm leading-relaxed'>University networks are uniquely powerful. By anchoring to institutional email verification, we ensure every connection is authentic and every collaborator is real.</p></div>
          <div className='bg-white rounded-2xl border border-gray-100 p-6'><h2 className='text-lg font-bold text-gray-900 mb-2'>What We Are Building</h2><p className='text-gray-500 text-sm leading-relaxed'>Beyond matching - useArco is evolving into a full execution layer for early-stage founders, including an AI Co-Founder advisor, project workspaces, and institutional partnerships.</p></div>
          <div className='bg-white rounded-2xl border border-gray-100 p-6'><h2 className='text-lg font-bold text-gray-900 mb-2'>Founded</h2><p className='text-gray-500 text-sm leading-relaxed'>useArco was founded in 2026 with the belief that the next generation of great companies will be built inside universities - before graduation, not after.</p></div>
        </div>
        <div className='bg-amber-50 rounded-2xl border border-amber-100 p-8 text-center'>
          <h2 className='text-xl font-bold text-gray-900 mb-2'>Get in Touch</h2>
          <p className='text-gray-500 mb-4'>Questions, partnerships, or university pilot inquiries welcome.</p>
          <a href='mailto:hello@usearco.com' className='inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors'>hello@usearco.com</a>
        </div>
      </div>
    </div>
  );
}