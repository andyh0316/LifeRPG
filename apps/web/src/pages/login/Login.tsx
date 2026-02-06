import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { api } from '@life-rpg/api-client';

interface LoginForm {
  email: string;
}

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>();

  // POST /auth/login sets httpOnly cookies (access_token, refresh_token)
  // via Set-Cookie response headers. The browser stores them automatically.
  const onSubmit = async (data: LoginForm) => {
    setError(null);
    const { error: apiError } = await api.POST('/auth/login', {
      body: { email: data.email },
    });

    if (apiError) {
      setError('Login failed. Check your email and try again.');
      return;
    }

    onLogin(); // triggers refetch of /auth/me in App.tsx
    navigate('/');
  };

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
        component="form"
        onSubmit={handleSubmit(onSubmit)}
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
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Email"
          type="email"
          autoFocus
          {...register('email', { required: true })}
        />
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Log in
        </Button>
      </Box>
    </Box>
  );
}
