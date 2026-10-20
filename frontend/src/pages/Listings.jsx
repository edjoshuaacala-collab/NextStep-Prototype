import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api.js';
import { matchSentence } from '../brand.js';
import { CategoryTag, Monogram } from '../components/Brand.jsx';
import { IconPin, IconSearch } from '../components/Icons.jsx';

const empty = {
  search: '',
  company: '',
  role: '',
  skills: '',
  location: '',
};

const STATUS_LINE = {
  Pending: 'You applied to this role',
  'Under review': 'Your application is under review',
  Endorsed: 'You were endorsed for this role',
};

function ListingRow({ item, featured = false, n }) {
  const note = item.application_status
    ? STATUS_LINE[item.application_status] || `Status: ${item.application_status}`
    : featured ? matchSentence(item.matched) : '';
  const where = [item.location, item.work_setup?.toLowerCase()].filter(Boolean).join(', ');

  return (
    <article className={`listing-row${featured ? ' featured' : ''}`} style={n != null ? { '--n': n } : undefined}>
      <Monogram company={item.company} />
      <div className="listing-text">
        <CategoryTag category={item.role_category} />
        <h3>{item.title}</h3>
        <span className="company">{item.company}</span>
        <span className="meta-line"><IconPin size={15} />{where}</span>
      </div>
      <div className="listing-side">
        {note && <span className={item.application_status ? 'listing-status' : 'listing-match'}>{note}</span>}
        <Link className={`btn ${featured ? 'btn-filled' : 'btn-tonal'}`} to={`/listings/${item.id}`}>
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
      <section className="page-head">
        <h1>Internship Listings</h1>
        <p>{items.length} open listings</p>

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

          <div className="rows rows-reveal">
            {recommended.map((item, n) => (
              <ListingRow key={item.id} item={item} featured n={n} />
            ))}
          </div>
        </>
      )}

      <div className="section-head">
        <h2>All internship listings</h2>
        {!loading && (
          <span className="chip">
            {normalItems.length} {recommended.length > 0 ? 'more' : normalItems.length === 1 ? 'listing' : 'listings'}
          </span>
        )}
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
        <div className="rows">
          {normalItems.map((item) => (
            <ListingRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
