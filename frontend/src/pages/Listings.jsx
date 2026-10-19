import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { IconPin, IconSearch } from '../components/Icons.jsx';

const empty = {
  search: '',
  company: '',
  role: '',
  skills: '',
  location: '',
};

function ListingCard({ item, featured = false }) {
  return (
    <article className={`listing${featured ? ' listing-featured' : ''}`}>
      <div className="chips">
        {item.role_category && <span className="chip">{item.role_category}</span>}
        {item.work_setup && <span className="chip">{item.work_setup}</span>}
      </div>

      <div className="listing-head">
        <h3>{item.title}</h3>
        <div className="company">{item.company}</div>
      </div>

      <p className="skills">
        {Array.isArray(item.skills)
          ? item.skills.slice(0, 3).join(', ')
          : 'See listing details'}
      </p>

      <span className="meta-line"><IconPin size={16} />{item.location}</span>

      <div className="listing-foot">
        {item.application_status ? (
          <StatusBadge status={item.application_status} />
        ) : <span />}

        <Link
          className={`btn ${featured ? 'btn-filled' : 'btn-tonal'}`}
          to={`/listings/${item.id}`}
        >
          View details
        </Link>
      </div>
    </article>
  );
}

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
    <span className="filter-chip">
      <select
        value={f[k]}
        onChange={set(k)}
        aria-label={label}
        className={f[k] ? 'selected' : ''}
      >
        <option value="">{label}</option>
        {list.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </span>
  );

  const recommendedIds = new Set(
    recommended.map((item) => Number(item.id))
  );

  const normalItems = items.filter(
    (item) => !recommendedIds.has(Number(item.id))
  );

  return (
    <>
      <section className="hero">
        <span className="chip">Internships</span>
        <h1>Internship Listings</h1>
        <p>{items.length} available opportunities</p>

        <form
          style={{ display: 'contents' }}
          onSubmit={(e) => {
            e.preventDefault();
            load(f);
          }}
        >
          <div className="search-bar">
            <IconSearch size={20} />
            <input
              placeholder="Search position or company"
              value={f.search}
              onChange={set('search')}
              aria-label="Search position or company"
            />
            <button className="btn btn-filled">Search</button>
          </div>

          <div className="filter-row">
            <Select k="company" label="Company" list={opts.companies} />
            <Select k="role" label="Role" list={opts.roles} />
            <Select k="skills" label="Skills" list={opts.skills} />
            <Select k="location" label="Location" list={opts.locations} />

            <button
              type="button"
              className="btn btn-text"
              onClick={() => {
                setF(empty);
                load(empty);
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {recommended.length > 0 && (
        <>
          <div className="section-head">
            <h2>Recommended for you</h2>
            <span className="chip chip-gold">AI matched</span>
          </div>
          <p className="section-note">
            These internships were selected based on your conversation
            with the NextStep matching assistant.
          </p>

          <div className="cards">
            {recommended.map((item) => (
              <ListingCard key={item.id} item={item} featured />
            ))}
          </div>
        </>
      )}

      <div className="section-head">
        <h2>All internship listings</h2>
        {!loading && <span className="chip">{normalItems.length} results</span>}
      </div>

      {error && <p className="err">{error}</p>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : normalItems.length === 0 ? (
        <p className="card empty">
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
