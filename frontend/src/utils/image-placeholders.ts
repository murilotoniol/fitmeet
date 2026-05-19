const ACTIVITY_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
  <rect width="1200" height="675" fill="#f2f2f2" />
  <rect x="40" y="40" width="1120" height="595" rx="28" fill="#e5e5e5" />
  <circle cx="210" cy="210" r="86" fill="#00bc7d" fill-opacity="0.16" />
  <rect x="150" y="390" width="420" height="36" rx="18" fill="#d4d4d4" />
  <rect x="150" y="448" width="280" height="24" rx="12" fill="#d4d4d4" />
  <text x="150" y="320" fill="#171717" font-family="Arial, sans-serif" font-size="72" font-weight="700">FITMEET</text>
</svg>
`)}`;

const CATEGORY_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <rect width="240" height="240" rx="120" fill="#f2f2f2" />
  <circle cx="120" cy="120" r="92" fill="#e5e5e5" />
  <circle cx="120" cy="92" r="32" fill="#00bc7d" fill-opacity="0.28" />
  <rect x="66" y="138" width="108" height="36" rx="18" fill="#00bc7d" fill-opacity="0.22" />
</svg>
`)}`;

const AVATAR_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <rect width="240" height="240" rx="120" fill="#f7f7f7" />
  <circle cx="120" cy="88" r="34" fill="#d4d4d4" />
  <path d="M54 186c10-34 40-56 66-56s56 22 66 56" fill="#d4d4d4" />
</svg>
`)}`;

export { ACTIVITY_PLACEHOLDER, AVATAR_PLACEHOLDER, CATEGORY_PLACEHOLDER };
