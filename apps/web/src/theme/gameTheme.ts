// Nintendo Switch 2 inspired — clean, minimal, dark sidebar + light content

export const GAME_COLORS = {
  // Nintendo red accent
  accent: '#E60012',
  accentHover: '#CC0010',
  accentSubtle: 'rgba(230, 0, 18, 0.08)',

  // Surfaces
  pageBg: '#F7F8FA',
  cardBg: '#FFFFFF',
  cardBorder: '#E8EAED',
  cardHover: '#FAFBFC',

  // Sidebar
  sidebarBg: '#1E1E2E',
  sidebarSurface: '#2A2A3D',
  sidebarText: '#E0E0E6',
  sidebarTextMuted: '#8888A0',
  sidebarHover: 'rgba(255,255,255,0.06)',
  sidebarActive: 'rgba(230, 0, 18, 0.15)',
  sidebarActiveBorder: '#E60012',
  sidebarDivider: 'rgba(255,255,255,0.08)',

  // Profile
  avatarBg: '#E60012',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // Rewards / badges
  xpGreen: '#22C55E',
  xpGreenSubtle: 'rgba(34,197,94,0.1)',
  coinGold: '#D4A017',
  coinGoldSubtle: 'rgba(212,160,23,0.10)',

  // Progress
  progressTrack: '#E5E7EB',

  // Misc
  divider: '#F0F0F4',
  inputBorder: '#D1D5DB',
} as const;

export const GAME_SHADOWS = {
  card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  cardHover: '0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
  banner: '0 1px 3px rgba(0,0,0,0.08)',
  button: '0 1px 2px rgba(0,0,0,0.05)',
} as const;

export const GAME_RADII = {
  card: '12px',
  button: '8px',
  progressBar: '6px',
  badge: '20px',
  dialog: '16px',
} as const;

// ── Reusable sx presets ──

/** Page title: bold Inter 1.5rem with tight tracking. */
export const sxPageTitle = {
  fontWeight: 800,
  fontSize: '1.5rem',
  color: GAME_COLORS.textPrimary,
  letterSpacing: '-0.02em',
} as const;

/** White card surface with subtle border + shadow. */
export const sxCard = {
  bgcolor: GAME_COLORS.cardBg,
  border: `1px solid ${GAME_COLORS.cardBorder}`,
  borderRadius: GAME_RADII.card,
  boxShadow: GAME_SHADOWS.card,
} as const;

/** Primary red accent button overrides. */
export const sxAccentButton = {
  fontWeight: 600,
  borderRadius: GAME_RADII.button,
  bgcolor: GAME_COLORS.accent,
  textTransform: 'none' as const,
  '&:hover': { bgcolor: GAME_COLORS.accentHover },
} as const;

/** Secondary outlined button overrides. */
export const sxOutlinedButton = {
  fontWeight: 600,
  borderRadius: GAME_RADII.button,
  borderColor: GAME_COLORS.cardBorder,
  color: GAME_COLORS.textSecondary,
  textTransform: 'none' as const,
  '&:hover': {
    borderColor: GAME_COLORS.textSecondary,
    bgcolor: 'rgba(0,0,0,0.02)',
  },
} as const;
