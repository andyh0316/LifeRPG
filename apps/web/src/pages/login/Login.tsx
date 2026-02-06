import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import GoogleIcon from '@mui/icons-material/Google';

export default function Login() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: 360,
          p: 4,
        }}
      >
        <Typography variant="h4" textAlign="center">
          LifeRPG
        </Typography>
        <Button
          variant="outlined"
          startIcon={<GoogleIcon />}
          href={`${import.meta.env.VITE_API_URL}/auth/google-login`}
        >
          Sign in with Google
        </Button>
      </Box>
    </Box>
  );
}
