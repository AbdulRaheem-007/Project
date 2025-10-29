import { useRouter } from 'next/router';
import TicketForm from '../../components/TicketForm';

export default function NewTicket() {
  const router = useRouter();

  const handleSubmit = async (payload) => {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return router.push('/tickets');
    const msg = await res.text();
    alert('Failed to save: ' + msg);
  };

  return (
    <div>
      <h1>Submit a Ticket</h1>
      <TicketForm onSubmit={handleSubmit} />
    </div>
  );
}
