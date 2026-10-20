// Small helpers shared by the dashboard, listings, applications and chat.

// Soft tints for company monograms and category tags (bg, text).
const TINTS = {
  blue: ['#DCE6FB', '#1B2A5E'],
  teal: ['#D3EFEA', '#0F5E55'],
  rose: ['#FBE2E6', '#8A2433'],
  violet: ['#E7E0FA', '#4B2C8F'],
  amber: ['#FCEFD0', '#7A5A0E'],
  green: ['#DCF2E2', '#1E6B3A'],
  sky: ['#D6EDF8', '#0E5A80'],
  slate: ['#E4E8EF', '#374151'],
};
const TINT_ORDER = Object.keys(TINTS);

const CATEGORY_TINT = {
  'Web Development': 'blue',
  'Database Administration': 'amber',
  'Data Analytics': 'teal',
  Design: 'rose',
  'IT Support & Networking': 'slate',
  'Mobile Development': 'violet',
  Cybersecurity: 'sky',
  'Quality Assurance': 'green',
  'Digital Marketing': 'rose',
  'AI & Machine Learning': 'violet',
  'Game Development': 'green',
  'Systems Analysis': 'slate',
};

function hash(text = '') {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

const tintStyle = (key) => ({ background: TINTS[key][0], color: TINTS[key][1] });

// Fixed colors for the seeded partner companies; anything else gets a stable hashed color.
const COMPANY_TINT = {
  'Bluepeak Software Inc.': 'blue', 'Luntian Tech Solutions': 'green', 'Mayon Finance Corp.': 'amber',
  'Harbor Analytics': 'teal', 'Kalye Digital Studio': 'rose', 'NorthGate Systems': 'slate', 'Pinya Labs': 'amber',
  'Bantay Secure Corp.': 'sky', 'Tala Testing Co.': 'violet', 'Sampaguita Health Network': 'rose',
  'Alon Creative Agency': 'sky', 'Tagpi AI Research': 'teal', 'Pixel Palay Studios': 'green', 'Kalikasan Logistics': 'slate',
};
export const companyTint = (company) =>
  tintStyle(COMPANY_TINT[company] || TINT_ORDER[hash(company) % TINT_ORDER.length]);

export const categoryTint = (category) =>
  tintStyle(CATEGORY_TINT[category] || TINT_ORDER[hash(category) % TINT_ORDER.length]);

const SUFFIXES = new Set(['inc', 'inc.', 'corp', 'corp.', 'co', 'co.', 'ltd', 'ltd.', 'llc']);
export function companyInitials(company = '') {
  const words = company.split(/\s+/).filter((w) => w && !SUFFIXES.has(w.toLowerCase()));
  return words.slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
}

// Matcher output looks like ["skill: react", "role: web"]. Turn it into a sentence.
const PROPER = {
  react: 'React', laravel: 'Laravel', mysql: 'MySQL', sql: 'SQL', php: 'PHP', python: 'Python',
  javascript: 'JavaScript', typescript: 'TypeScript', figma: 'Figma', flutter: 'Flutter', firebase: 'Firebase',
  excel: 'Excel', 'power bi': 'Power BI', linux: 'Linux', cisco: 'Cisco', windows: 'Windows', unity: 'Unity',
  'c#': 'C#', java: 'Java', git: 'Git', 'rest apis': 'REST APIs', html: 'HTML', css: 'CSS', selenium: 'Selenium',
  pandas: 'Pandas', uml: 'UML', seo: 'SEO', canva: 'Canva', dart: 'Dart', 'node.js': 'Node.js',
};
const ROLE_WORDS = {
  web: 'web development', data: 'data', design: 'design', ui: 'UI/UX design', mobile: 'mobile development',
  security: 'cybersecurity', qa: 'quality assurance', ai: 'AI and machine learning', game: 'game development',
  network: 'networking', support: 'IT support', database: 'databases', marketing: 'digital marketing', cloud: 'cloud',
};
const listJoin = (items) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

export function matchSentence(matched = []) {
  if (!Array.isArray(matched) || matched.length === 0) return '';
  const skills = [];
  const roles = [];
  for (const raw of matched) {
    const [kind, ...rest] = String(raw).split(':');
    const value = rest.join(':').trim().toLowerCase();
    if (!value) continue;
    if (kind.trim() === 'skill') skills.push(PROPER[value] || value);
    else if (kind.trim() === 'role') roles.push(ROLE_WORDS[value] || value);
  }
  const uniq = (a) => [...new Set(a)];
  if (skills.length) return `Fits your ${listJoin(uniq(skills).slice(0, 3))} skills`;
  if (roles.length) return `Matches your interest in ${listJoin(uniq(roles).slice(0, 2))}`;
  return '';
}

export function formatDate(value, short = false) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('en-US', short && sameYear
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' });
}

// Application status → step on the three-dot mini track.
export const STATUS_STEP = { Pending: 0, 'Under review': 1, Endorsed: 2 };

export function statusNote(status, appliedAt, updatedAt, short = false) {
  if (status === 'Endorsed') return `Endorsed ${formatDate(updatedAt || appliedAt, short)}`;
  if (status === 'Under review') return `In review since ${formatDate(updatedAt || appliedAt, short)}`;
  return `Applied ${formatDate(appliedAt, short)}`;
}
