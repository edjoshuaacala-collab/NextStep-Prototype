export default function Logo({ dark = false, size = 24 }) {
  return (
    <span className="logo" style={{ fontSize: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 18 L10 12 L14 15 L20 6" fill="none" stroke="#DAA52B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ color: dark ? '#1B2A5E' : '#fff' }}>Next</span>
      <span style={{ color: '#DAA52B' }}>Step</span>
    </span>
  );
}
