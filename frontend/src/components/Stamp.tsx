import { COLLEGE } from '../config';

// Rubber-stamp mark: on the landing notice and on the ticket receipt.
export function Stamp({ className = '', label = 'RECEIVED' }: { className?: string; label?: string }) {
  const ring = `${COLLEGE.office.toUpperCase()} ✦ ${COLLEGE.short} ${COLLEGE.city.toUpperCase()} ✦`;
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label={`${COLLEGE.office} stamp`}>
      <defs>
        <path id="stamp-ring" d="M60,60 m-41,0 a41,41 0 1,1 82,0 a41,41 0 1,1 -82,0" />
      </defs>
      <g fill="none" stroke="currentColor">
        <circle cx="60" cy="60" r="56" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="51" strokeWidth="1" />
        <circle cx="60" cy="60" r="31" strokeWidth="1" />
      </g>
      <text fill="currentColor" fontFamily="'Source Serif 4', Georgia, serif" fontSize="8.6" fontWeight="600">
        <textPath href="#stamp-ring" textLength="252" lengthAdjust="spacing">
          {ring}
        </textPath>
      </text>
      <text x="60" y="58" textAnchor="middle" fill="currentColor" fontFamily="'Source Serif 4', Georgia, serif" fontSize="13" fontWeight="700">
        {COLLEGE.short}
      </text>
      <text x="60" y="72" textAnchor="middle" fill="currentColor" fontFamily="'Source Serif 4', Georgia, serif" fontSize="7.5" letterSpacing="1">
        {label}
      </text>
    </svg>
  );
}
