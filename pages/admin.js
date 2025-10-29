import { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { supabase } from '../lib/supabaseClient';

const statuses = ['New', 'In Progress', 'Resolved', 'Closed'];

export default function Admin() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('All');

  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const res = await fetch('/api/tickets');
      if (!res.ok) throw new Error('Failed to load tickets');
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setTickets([]);
    }
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel('tickets_admin_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`/api/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const filtered = filter === 'All' ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div>
      <h1>Admin Board</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['All', ...statuses].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={filter === s ? 'primary' : ''}>{s}</button>
        ))}
        <button onClick={load}>Refresh</button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="list">
        {filtered.map((t) => (
          <div className="list-item" key={t.id}>
            <div>
              <strong>{t.title}</strong>
              <div className="muted clip-2">{t.description}</div>
              <StatusBadge status={t.status} />
            </div>
            <div>
              <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value)}>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p>No tickets found.</p>}
      </div>
    </div>
  );
}
