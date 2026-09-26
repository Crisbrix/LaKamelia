export default function HorseLogo({ className = 'w-16 h-16' }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Rancho Criadero La Kamelia">
      <g stroke="#1f1b18" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <path
          d="M68 16Q98 18 103 44Q112 58 103 74Q112 92 99 112L80 106Q94 88 92 70Q90 50 84 36Q78 24 68 22Z"
          fill="#e9c46a"
        />
        <path
          d="M16 88C30 74 48 52 64 26c8-8 20-4 24 8 6 12 7 34 2 52-4 14-16 24-32 22-10-1-18-2-22-4-12 0-22-6-20-16z"
          fill="#fffdf7"
        />
        <path d="M60 34L54 4c-1-7 7-9 10-4l8 30z" fill="#e9c46a" />
        <path d="M76 36l2-28c1-7 9-8 11-2l4 32z" fill="#e9c46a" />
        <ellipse cx="33" cy="92" rx="12" ry="9" transform="rotate(-34 33 92)" fill="#f4a7b9" />
        <ellipse cx="31" cy="86" rx="3" ry="4" transform="rotate(-34 31 86)" fill="#1f1b18" stroke="none" />
        <path d="M27 98c5 4 12 5 18 4" fill="none" />
        <circle cx="70" cy="48" r="5.5" fill="#1f1b18" />
        <path d="M30 16c10 0 14 6 14 12" fill="none" />
        <circle cx="30" cy="14" r="7" fill="#c0392b" />
        <path d="M96 96c6 4 10 10 10 10" fill="none" />
        <circle cx="108" cy="110" r="6" fill="#4c7a34" />
      </g>
    </svg>
  );
}
