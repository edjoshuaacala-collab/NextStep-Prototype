const cls = { Pending: 'badge-gold', 'Under review': 'badge-blue', Endorsed: 'badge-green' };
export default function StatusBadge({ status }) {
  return <span className={`badge ${cls[status] || 'badge-blue'}`}>{status}</span>;
}
