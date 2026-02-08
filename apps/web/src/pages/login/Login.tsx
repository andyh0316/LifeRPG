import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import GoogleIcon from '@mui/icons-material/Google';
import {
  GAME_COLORS,
  GAME_RADII,
  GAME_SHADOWS,
  sxAccentButton,
} from '@/theme/gameTheme';

export default function Login() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        bgcolor: GAME_COLORS.sidebarBg,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          width: 360,
          p: 4,
          bgcolor: GAME_COLORS.cardBg,
          borderRadius: GAME_RADII.card,
          boxShadow: GAME_SHADOWS.cardHover,
          textAlign: 'center',
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '2rem',
            color: GAME_COLORS.textPrimary,
            letterSpacing: '-0.02em',
          }}
        >
          Life
          <Box component="span" sx={{ color: GAME_COLORS.accent }}>
            RPG
          </Box>
        </Typography>

        <Typography
          sx={{ fontSize: '0.9rem', color: GAME_COLORS.textSecondary }}
        >
          Level up your life, one quest at a time.
        </Typography>

        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          href={`${import.meta.env.VITE_API_URL}/auth/google-login`}
          sx={{ ...sxAccentButton, py: 1.2 }}
        >
          Sign in with Google
        </Button>
      </Box>
    </Box>
  );
}
