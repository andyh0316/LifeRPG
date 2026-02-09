import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import StarIcon from '@mui/icons-material/Star';
import CoinIcon from './icons/CoinIcon';
import { useQueryClient } from '@tanstack/react-query';
import { $api } from '@life-rpg/api-client';
import { GAME_COLORS } from '@/theme/gameTheme';
import useAnimateCountUp from '@/hooks/useAnimateCountUp';

interface CharacterSummary {
  id: number;
  name: string;
  level: number;
  xp: number;
  coins: number;
}

interface ProfileCardProps {
  characters: CharacterSummary[];
  activeCharacterId: number;
}

export default function ProfileCard({
  characters,
  activeCharacterId,
}: ProfileCardProps) {
  const queryClient = useQueryClient();
  const active =
    characters.find((c) => c.id === activeCharacterId) ?? characters[0];

  const selectCharacter = $api.useMutation('patch', '/auth/select-character', {
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const animatedCoins = useAnimateCountUp(active.coins);
  const animatedXp = useAnimateCountUp(active.xp);

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
            {animatedXp.toLocaleString()} XP
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
