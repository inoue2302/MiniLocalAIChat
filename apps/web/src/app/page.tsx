'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [health, setHealth] = useState<{ ok: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Mini Local AI Chat</h1>
      <div style={{ marginTop: '1rem' }}>
        <h2>API Health Check</h2>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {health && (
          <pre style={{ background: '#f4f4f4', padding: '1rem' }}>
            {JSON.stringify(health, null, 2)}
          </pre>
        )}
        {!health && !error && <p>Checking...</p>}
      </div>
    </div>
  );
}
