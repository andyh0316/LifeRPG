import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from '@/components/mui/TextField';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ITEM_ICON_REGISTRY,
  ITEM_ICON_CATEGORIES,
} from '@/components/icons/itemIconRegistry';
import {
  GAME_COLORS,
  GAME_RADII,
  sxPageTitle,
  sxCard,
} from '@/theme/gameTheme';

interface LocationState {
  returnTo: string;
  currentIcon?: string | null;
  formData?: Record<string, unknown>;
}

export default function PickIcon() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const currentIcon = state?.currentIcon ?? null;
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return ITEM_ICON_REGISTRY;
    const q = search.toLowerCase();
    return ITEM_ICON_REGISTRY.filter(
      (e) =>
        e.label.toLowerCase().includes(q) || e.name.toLowerCase().includes(q),
    );
  }, [search]);

  const grouped = useMemo(() => {
    if (search) return null;
    const groups: Record<string, typeof ITEM_ICON_REGISTRY> = {};
    for (const category of ITEM_ICON_CATEGORIES) {
      const items = filtered.filter((e) => e.category === category);
      if (items.length > 0) groups[category] = items;
    }
    return groups;
  }, [filtered, search]);

  const handleSelect = (name: string | null) => {
    navigate(state?.returnTo ?? '/items', {
      state: { selectedIcon: name, formData: state?.formData },
    });
  };

  const handleBack = () => {
    navigate(state?.returnTo ?? '/items', {
      state: { formData: state?.formData },
    });
  };

  const renderIcon = (entry: (typeof ITEM_ICON_REGISTRY)[number]) => {
    const selected = currentIcon === entry.name;
    return (
      <Box
        key={entry.name}
        onClick={() => handleSelect(entry.name)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          p: 1,
          borderRadius: GAME_RADII.button,
          cursor: 'pointer',
          border: '2px solid',
          borderColor: selected ? GAME_COLORS.accent : 'transparent',
          bgcolor: selected ? GAME_COLORS.accentSubtle : 'transparent',
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: GAME_COLORS.accentSubtle,
            transform: 'scale(1.05)',
          },
          width: 72,
        }}
      >
        <entry.component
          sx={{
            fontSize: 28,
            color: selected ? GAME_COLORS.accent : GAME_COLORS.textPrimary,
          }}
        />
        <Typography
          sx={{
            fontSize: '0.6rem',
            color: GAME_COLORS.textMuted,
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {entry.label}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
        }}
      >
        <IconButton onClick={handleBack} sx={{ color: GAME_COLORS.textMuted }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={sxPageTitle}>Choose an Icon</Typography>
      </Box>

      <Box sx={{ ...sxCard, p: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            size="small"
            autoFocus
          />
          {currentIcon && (
            <Box
              onClick={() => handleSelect(null)}
              sx={{
                px: 1.5,
                display: 'flex',
                alignItems: 'center',
                borderRadius: GAME_RADII.button,
                cursor: 'pointer',
                color: GAME_COLORS.textMuted,
                whiteSpace: 'nowrap',
                fontSize: '0.8rem',
                fontWeight: 600,
                '&:hover': { color: '#e53935' },
              }}
            >
              Clear
            </Box>
          )}
        </Box>

        {grouped ? (
          ITEM_ICON_CATEGORIES.map((category) => {
            const items = grouped[category];
            if (!items) return null;
            return (
              <Box key={category} sx={{ mb: 2.5 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: GAME_COLORS.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 1,
                  }}
                >
                  {category}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {items.map(renderIcon)}
                </Box>
              </Box>
            );
          })
        ) : filtered.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {filtered.map(renderIcon)}
          </Box>
        ) : (
          <Typography
            sx={{
              color: GAME_COLORS.textMuted,
              textAlign: 'center',
              py: 4,
            }}
          >
            No icons found
          </Typography>
        )}
      </Box>
    </Box>
  );
}
