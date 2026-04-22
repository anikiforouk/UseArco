import { useState } from "react";
import { useRouter } from 'next/router';
import Link from 'next/link';
import api, { setToken } from '../lib/api';

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    // Read actual DOM values to handle browser autofill (Firefox/Chrome)
    const emailVal = e.target.elements.email?.value || form.email;
    const passwordVal = e.target.elements.password?.value || form.password;
    if (!emailVal || !passwordVal) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.post('/auth/login', { email: emailVal, password: passwordVal });
      setToken(data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <img src="/logo.png" alt="useArco" style={{ height: '48px', width: 'auto' }} />
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Log in to your useArco account</p>
          </div>
          {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Email</label>
              <input className="input" type="email" placeholder="alex@example.com" name="email" autoComplete="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Password</label>
              <input className="input" type="password" placeholder="Your password" name="password" autoComplete="current-password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</button>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
            No account? <Link href="/register" style={{ color: 'var(--accent)' }}>Join free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
