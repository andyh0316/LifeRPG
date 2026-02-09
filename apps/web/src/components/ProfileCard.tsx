import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CoinIcon from './icons/CoinIcon';
import { useQueryClient } from '@tanstack/react-query';
import { $api } from '@life-rpg/api-client';
import { GAME_COLORS, GAME_RADII } from '@/theme/gameTheme';
import useAnimateCountUp from '@/hooks/useAnimateCountUp';

export default function ProfileCard() {
  const queryClient = useQueryClient();

  const { data: summary } = $api.useQuery('get', '/user-character/summary');
  const characters = summary?.characters ?? [];
  const activeCharacterId = summary?.activeCharacterId;
  const active =
    characters.find((c) => c.id === activeCharacterId) ?? characters[0];

  const selectCharacter = $api.useMutation('patch', '/user-character/select', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/user-character/summary').queryKey,
      });
    },
  });

  const animatedCoins = useAnimateCountUp(active?.coins ?? 0);

  const { data: xpLevels } = $api.useQuery('get', '/user-character/xp-levels');
  const entry = xpLevels?.find((e) => e.level === active?.level);
  const xpInLevel = entry && active ? active.xp - entry.cumulativeXp : 0;
  const xpToNext = entry?.xpToNext ?? 0;
  const isMaxLevel = xpToNext === 0;
  const pct = isMaxLevel ? 100 : Math.min((xpInLevel / xpToNext) * 100, 100);
  const animatedXpInLevel = useAnimateCountUp(xpInLevel);

  if (!active) return null;

  return (
    <Box
      sx={{
        mx: 1.5,
        p: 1.5,
        borderRadius: '10px',
        bgcolor: GAME_COLORS.sidebarSurface,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: GAME_COLORS.avatarBg,
            fontSize: '0.9rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {active.name.charAt(0).toUpperCase()}
        </Avatar>

        {characters.length > 1 ? (
          <Select
            size="small"
            fullWidth
            value={activeCharacterId}
            onChange={(e) =>
              selectCharacter.mutate({
                body: { characterId: Number(e.target.value) },
              })
            }
            sx={{
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '& .MuiSelect-select': { py: 0.5, pl: 0 },
              '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' },
            }}
          >
            {characters.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.85rem',
              color: GAME_COLORS.sidebarText,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {active.name}
          </Typography>
        )}
      </Box>

      {/* Level bar */}
      <Box sx={{ mb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            mb: 0.5,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: GAME_COLORS.xpGreen,
            }}
          >
            Lv. {active.level}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.65rem',
              fontWeight: 600,
              color: GAME_COLORS.sidebarTextMuted,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {isMaxLevel
              ? 'MAX'
              : `${animatedXpInLevel.toLocaleString()} / ${xpToNext.toLocaleString()} XP`}
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'relative',
            height: 6,
            borderRadius: GAME_RADII.progressBar,
            bgcolor: 'rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              width: `${pct}%`,
              borderRadius: GAME_RADII.progressBar,
              bgcolor: GAME_COLORS.xpGreen,
              transition: 'width 0.6s ease',
            }}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.25,
            borderRadius: '6px',
            bgcolor: GAME_COLORS.coinGoldSubtle,
            border: `1px solid ${GAME_COLORS.coinGold}33`,
          }}
        >
          <CoinIcon sx={{ fontSize: 14 }} />
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: GAME_COLORS.coinGold,
            }}
          >
            {animatedCoins.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
