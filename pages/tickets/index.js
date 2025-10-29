import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '../../components/StatusBadge';
import { supabase } from '../../lib/supabaseClient';

function timeAgo(ts) {
  const d = new Date(ts);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const dd = Math.floor(h / 24); return `${dd}d ago`;
}

function exportCsv(rows) {
  const header = ['id','title','description','status','created_at'];
  const records = rows.map(t => [t.id, t.title, t.description, t.status, t.created_at]);
  const lines = [header, ...records].map(r => r.map(v => '"' + String(v ?? '').replace(/"/g,'""') + '"').join(',')).join('\n');
  const blob = new Blob([lines], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'tickets.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function TicketsList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('new');

  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tickets');
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to load tickets');
      }
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel('tickets_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const remove = async (id) => {
    if (!confirm('Delete this ticket?')) return;
    await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
    await load();
  };

  const filtered = useMemo(() => tickets.filter((t) => {
    const q = query.toLowerCase();
    const matchesQ = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    const matchesS = status === 'All' || t.status === status;
    return matchesQ && matchesS;
  }).sort((a,b) => sort === 'new' ? (new Date(b.created_at) - new Date(a.created_at)) : (a.title.localeCompare(b.title))), [tickets, query, status, sort]);

  return (
    <div>
      <div className="page-header">
        <h1>Tickets</h1>
        <Link className="button primary" href="/tickets/new">+ New Ticket</Link>
      </div>

      <div className="filters">
        <input placeholder="Search by title/description" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {['All','New','In Progress','Resolved','Closed'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="new">Newest</option>
          <option value="title">Title A-Z</option>
        </select>
        <button onClick={load}>Refresh</button>
        <button onClick={() => exportCsv(filtered)}>Export CSV</button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="list">
          {filtered.map((t) => (
            <div className="list-item" key={t.id}>
              <div>
                <Link href={`/tickets/${t.id}`}><strong>{t.title}</strong></Link>
                <div className="muted clip-2">{t.description}</div>
                <div className="muted">{timeAgo(t.created_at)}</div>
                <StatusBadge status={t.status} />
              </div>
              <div className="actions">
                <Link className="button" href={`/tickets/${t.id}`}>Edit</Link>
                <button className="danger" onClick={() => remove(t.id)}>Delete</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p>No tickets match your filters.</p>}
        </div>
      )}
    </div>
  );
}
