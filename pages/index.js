import { useEffect, useState } from 'react';

export default function Home() {
  const [stats, setStats] = useState({ total: 0, byStatus: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setError('');
        const res = await fetch('/api/tickets');
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || 'Failed to load tickets');
        }
        const data = await res.json();
        const items = Array.isArray(data) ? data : [];
        const byStatus = items.reduce((acc, t) => {
          acc[t.status] = (acc[t.status] || 0) + 1;
          return acc;
        }, {});
        setStats({ total: items.length, byStatus });
      } catch (e) {
        setError(e.message);
        setStats({ total: 0, byStatus: {} });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <h1>Support Tickets Dashboard</h1>
      <p>Simple Next.js + Supabase CRUD app.</p>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div className="card">
            <h3>Total Tickets</h3>
            <p style={{ fontSize: 32, margin: 0 }}>{stats.total}</p>
          </div>
          {Object.entries(stats.byStatus).map(([k, v]) => (
            <div className="card" key={k}>
              <h3>{k}</h3>
              <p style={{ fontSize: 28, margin: 0 }}>{v}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
