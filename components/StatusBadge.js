export default function StatusBadge({ status }) {
  const color = {
    'New': 'badge blue',
    'In Progress': 'badge amber',
    'Resolved': 'badge green',
    'Closed': 'badge gray',
  }[status] || 'badge gray';
  return <span className={color}>{status}</span>;
}
