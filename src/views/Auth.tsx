import { Box, Button, Card, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Typography } from '@mui/material';
import { useAuth } from '../AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { VisibilityOff, Visibility } from '@mui/icons-material'

const Auth = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [errText, setErrText] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const creds = {
      username: formData.get('username')!.toString(),
      password: formData.get('password')!.toString(),
    };

    await auth.login(creds, (err) => {
      if (err) {
        setErrText(err.toString());
        return;
      }

      navigate('/');
    });
  };

  return (
    <Card variant="outlined" className="auth-form">
      <Typography
        variant="body1"
        color="red"
        sx={{mb:4}}
        display={errText.length !== 0 ? "block" : "none" }
      >
        {errText}
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: 3,
        }}
      >
        <FormControl variant="outlined">
          <InputLabel htmlFor="username">Username</InputLabel>
          <OutlinedInput
            id="username"
            name="username"
            required
            label="username"
          />
        </FormControl>

        <FormControl variant="outlined">
          <InputLabel htmlFor="password">Password</InputLabel>
          <OutlinedInput
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          sx={{ width: 250, height: 50, alignSelf: 'center' }}
        >
          Sign in
        </Button>
      </Box>
    </Card>
  )
};

export default Auth;
