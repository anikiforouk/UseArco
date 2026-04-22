import { useState, useEffect } from 'react';
import '../styles/globals.css';
import Navbar from '../components/Navbar';
import api, { getToken } from '../lib/api';

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (getToken()) {
      api.get('/auth/me')
        .then(res => setUser(res.data.user || res.data))
        .catch(() => setUser(null));
    }
  }, []);

  const handleUserUpdate = (updatedUser) => setUser(updatedUser);

  return (
    <>
      <Navbar user={user} onUserUpdate={handleUserUpdate} />
      <Component {...pageProps} user={user} setUser={setUser} />
    </>
  );
}
