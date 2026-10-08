// A single optical grid and stroke weight for every control surface.
export const iconPaths={
  projects:'<path d="M3 8V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 8h18"/>',
  activity:'<path d="M3 3v18h18M6 15l4-5 4 3 6-8M16 5h4v4"/>',
  review:'<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M6 7v10M18 7v3a5 5 0 0 1-5 5H6"/>',
  missions:'<rect x="4" y="4" width="16" height="17" rx="3"/><path d="M9 4V3h6v1M8 10l1 1 2-2M14 10h2M8 16l1 1 2-2M14 16h2"/>',
  agents:'<rect x="4" y="7" width="16" height="13" rx="4"/><path d="M12 3v4M1 12v4M23 12v4M9 16h6"/><circle cx="8.5" cy="12" r=".8"/><circle cx="15.5" cy="12" r=".8"/>',
  database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  codex:'<path d="m8 6-6 6 6 6M16 6l6 6-6 6M14 4l-4 16"/>',
  account:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  appearance:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none"/>',
  refresh:'<path d="M20 7v5h-5M4 17v-5h5M5.4 7a8 8 0 0 1 13-2L20 7M4 17l1.6 2a8 8 0 0 0 13-2"/>',
  settings:'<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3" fill="var(--surface,#303247)"/><circle cx="16" cy="17" r="3" fill="var(--surface,#303247)"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  arrow:'<path d="M6 18 18 6M6 6h12v12"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>'
};
export function icon(name){return `<svg class="ui-icon" data-icon-name="${name}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name]||iconPaths.projects}</svg>`;}
