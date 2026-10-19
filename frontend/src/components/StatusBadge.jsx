const cls = { Pending: 'badge-pending', 'Under review': 'badge-review', Endorsed: 'badge-endorsed' };
export default function StatusBadge({ status }) {
  return <span className={`badge ${cls[status] || 'badge-review'}`}>{status}</span>;
}
