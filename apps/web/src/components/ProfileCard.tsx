import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import StarIcon from '@mui/icons-material/Star';
import CoinIcon from './icons/CoinIcon';
import { $api } from '@life-rpg/api-client';
import { GAME_COLORS } from '@/theme/gameTheme';
import useAnimateCountUp from '@/hooks/useAnimateCountUp';

export default function ProfileCard() {
  const { data: users = [] } = $api.useQuery('get', '/users');
  const userId = users[0]?.id;

  const { data: profile } = $api.useQuery(
    'get',
    '/users/{id}',
    { params: { path: { id: userId! } } },
    { enabled: !!userId },
  );

  const animatedCoins = useAnimateCountUp(profile?.coins ?? 0);
  const animatedXp = useAnimateCountUp(profile?.xp ?? 0);

  if (!profile) return null;

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
          }}
        >
          {profile.fullName.charAt(0).toUpperCase()}
        </Avatar>
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
          {profile.fullName}
        </Typography>
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
            {animatedCoins}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.25,
            borderRadius: '6px',
            bgcolor: GAME_COLORS.xpGreenSubtle,
            border: `1px solid ${GAME_COLORS.xpGreen}33`,
          }}
        >
          <StarIcon sx={{ fontSize: 14, color: GAME_COLORS.xpGreen }} />
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: GAME_COLORS.xpGreen,
            }}
          >
            {animatedXp} XP
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
