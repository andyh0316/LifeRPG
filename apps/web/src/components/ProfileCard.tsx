import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CoinDisplay from './CoinDisplay';
import { useQueryClient } from '@tanstack/react-query';
import { $api } from '@life-rpg/api-client';
import { GAME_COLORS } from '@/theme/gameTheme';
import useActiveCharacter from '@/hooks/useActiveCharacter';
import useAnimateCountUp from '@/hooks/useAnimateCountUp';
import LevelBar from './LevelBar';

export default function ProfileCard() {
  const queryClient = useQueryClient();

  const { characters, activeCharacterId, active } = useActiveCharacter();

  const selectCharacter = $api.useMutation('patch', '/user-character/select', {
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const animatedCoins = useAnimateCountUp(active?.coins ?? 0);

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

      <Box sx={{ pt: 0.75, pb: 1.5 }}>
        <CoinDisplay amount={animatedCoins} size="md" />
      </Box>

      <LevelBar />
    </Box>
  );
}
