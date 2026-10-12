import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';

const empty = {
  search: '',
  company: '',
  role: '',
  skills: '',
  location: '',
};

export default function Listings() {
  const location = useLocation();

  const recommended = Array.isArray(location.state?.recommended)
    ? location.state.recommended
    : [];

  const [f, setF] = useState(empty);
  const [opts, setOpts] = useState({
    companies: [],
    roles: [],
    skills: [],
    locations: [],
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = (params) => {
    setLoading(true);

    api('/internships', { params })
      .then((r) => {
        setItems(r.data);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api('/internships/filters')
      .then(setOpts)
      .catch(() => {});

    load(empty);
  }, []);

  const set = (k) => (e) =>
    setF((previous) => ({
      ...previous,
      [k]: e.target.value,
    }));

  const Select = ({ k, label, list }) => (
    <select value={f[k]} onChange={set(k)} aria-label={label}>
      <option value="">{label}</option>
      {list.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );

  const recommendedIds = new Set(
    recommended.map((item) => Number(item.id))
  );

  const normalItems = items.filter(
    (item) => !recommendedIds.has(Number(item.id))
  );

  const ListingCard = ({ item }) => (
    <article className="card listing" key={item.id}>
      <h3>{item.title}</h3>
      <div className="company">{item.company}</div>

      <p className="small">
        Qualifications:{' '}
        {Array.isArray(item.skills)
          ? item.skills.slice(0, 3).join(', ')
          : 'See listing details'}
      </p>

      <p className="small">Location: {item.location}</p>

      {item.work_setup && (
        <p className="small">Work setup: {item.work_setup}</p>
      )}

      <div className="row-end">
        {item.application_status && (
          <StatusBadge status={item.application_status} />
        )}

        <Link
          className="btn btn-navy btn-sm"
          to={`/listings/${item.id}`}
        >
          View details
        </Link>
      </div>
    </article>
  );

  return (
    <>
      <h1>Internship Listings</h1>

      <p className="muted">
        {items.length} available opportunities
      </p>

      {recommended.length > 0 && (
        <section className="recommendations-section">
          <h2>AI Recommended For You</h2>
          <p className="muted">
            These internships were selected based on your conversation
            with the NextStep matching assistant.
          </p>

          <div className="cards">
            {recommended.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <h2>All Internship Listings</h2>

      <form
        className="card filters"
        onSubmit={(e) => {
          e.preventDefault();
          load(f);
        }}
      >
        <input
          placeholder="Search position or company"
          value={f.search}
          onChange={set('search')}
        />

        <Select
          k="company"
          label="Company"
          list={opts.companies}
        />

        <Select k="role" label="Role" list={opts.roles} />

        <Select
          k="skills"
          label="Skills"
          list={opts.skills}
        />

        <Select
          k="location"
          label="Location"
          list={opts.locations}
        />

        <button className="btn btn-gold">Search</button>

        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            setF(empty);
            load(empty);
          }}
        >
          Clear
        </button>
      </form>

      {error && <p className="err">{error}</p>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : normalItems.length === 0 ? (
        <p className="card muted">
          {recommended.length > 0
            ? 'No additional internships match your filters. Your AI recommendations are shown above.'
            : 'No internships match your filters.'}
        </p>
      ) : (
        <div className="cards">
          {normalItems.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
