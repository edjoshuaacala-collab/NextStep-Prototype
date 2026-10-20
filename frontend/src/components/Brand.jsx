import { categoryTint, companyInitials, companyTint, STATUS_STEP } from '../brand.js';

export function Monogram({ company, size = 48 }) {
  return (
    <span
      className="monogram"
      style={{ ...companyTint(company), width: size, height: size, fontSize: size >= 44 ? 16 : 13 }}
      aria-hidden="true"
    >
      {companyInitials(company)}
    </span>
  );
}

export function CategoryTag({ category }) {
  if (!category) return null;
  return <span className="tag" style={categoryTint(category)}>{category}</span>;
}

// Three dots: Applied → Under review → Endorsed.
export function MiniTrack({ status }) {
  const step = STATUS_STEP[status] ?? 0;
  const endorsed = status === 'Endorsed';
  return (
    <span className="mini-track" role="img" aria-label={`Application status: ${status}`}>
      {[0, 1, 2].map((i) => {
        let state = i < step ? 'done' : i === step ? 'current' : 'todo';
        if (endorsed && i === 2) state = 'done';
        return (
          <span key={i} className="mini-step">
            {i > 0 && <span className={`mini-line${i <= step ? ' done' : ''}`} />}
            <span className={`mini-dot ${state}`} />
          </span>
        );
      })}
    </span>
  );
}
