import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TicketForm from '../../components/TicketForm';
import StatusBadge from '../../components/StatusBadge';

export default function EditTicket() {
  const router = useRouter();
  const { id } = router.query;
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tickets/${id}`).then((r) => r.json()).then(setTicket);
  }, [id]);

  const handleSubmit = async (payload) => {
    const res = await fetch(`/api/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) router.push('/tickets');
  };

  const remove = async () => {
    if (!confirm('Delete this ticket?')) return;
    await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
    router.push('/tickets');
  };

  if (!ticket) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Edit Ticket</h1>
        <StatusBadge status={ticket.status} />
      </div>
      <TicketForm initial={ticket} onSubmit={handleSubmit} />
      <button className="danger" onClick={remove}>Delete</button>
    </div>
  );
}
