export default function CowLogo({ className = 'w-16 h-16' }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Rancho Criadero La Kamelia">
      <g stroke="#1f1b18" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M24 34c-8-6-14-4-16 2 6 2 10 8 12 14" fill="#e9c46a" />
        <path d="M96 34c8-6 14-4 16 2-6 2-10 8-12 14" fill="#e9c46a" />
        <rect x="22" y="28" width="76" height="62" rx="26" fill="#fffdf7" />
        <path d="M38 40c8-6 18-4 22 4-6 8-18 8-22-4z" fill="#1f1b18" stroke="none" />
        <path d="M74 66c7-5 16-3 19 4-6 6-16 5-19-4z" fill="#1f1b18" stroke="none" />
        <ellipse cx="60" cy="76" rx="20" ry="15" fill="#f4a7b9" />
        <circle cx="52" cy="76" r="3.5" fill="#1f1b18" stroke="none" />
        <circle cx="68" cy="76" r="3.5" fill="#1f1b18" stroke="none" />
        <circle cx="43" cy="50" r="5" fill="#1f1b18" />
        <circle cx="77" cy="50" r="5" fill="#1f1b18" />
        <path d="M30 16c10 0 14 6 14 12" fill="none" />
        <circle cx="30" cy="14" r="7" fill="#c0392b" />
        <path d="M96 96c6 4 10 10 10 10" fill="none" />
        <circle cx="108" cy="110" r="6" fill="#4c7a34" />
      </g>
    </svg>
  );
}
