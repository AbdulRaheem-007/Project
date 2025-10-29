import { useState } from 'react';

const statuses = ['New', 'In Progress', 'Resolved', 'Closed'];

export default function TicketForm({ initial, onSubmit }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [status, setStatus] = useState(initial?.status || 'New');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (title.trim().length < 3) return setError('Title must be at least 3 characters');
    if (description.trim().length < 10) return setError('Description must be at least 10 characters');
    setError('');
    onSubmit({ title: title.trim(), description: description.trim(), status });
  };

  return (
    <form onSubmit={submit} className="card" style={{ maxWidth: 640 }}>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Brief summary" />
      </label>
      <label>
        Issue Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} placeholder="Describe the issue" />
      </label>
      <label>
        Status
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" className="primary">Save</button>
    </form>
  );
}
