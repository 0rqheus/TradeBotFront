import { Box, Button, Card, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Casino } from '@mui/icons-material'
import { sendRequest } from '../utils/request';
import { useAuth } from '../AuthProvider';
import { AlertData, CustomAlert } from './partials/CustomAlert';

const CreateUser = () => {
  const auth = useAuth();

  const [alert, setAlert] = useState<AlertData>({ open: false });

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [errText, setErrText] = useState('');

  useEffect(() => {
    generateRandomPassword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateRandomPassword = async () => {
    try {
      const res = await sendRequest(
        'users/get_random_password',
        undefined,
        auth.user?.token,
        'GET'
      );
      const data = await res.json();
      setPassword(data.password);
    } catch (err: any) {
      setErrText(err.toString());
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();

      const res = await sendRequest(
        'users/insert_user',
        { login, password },
        auth.user?.token
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setErrText('');
      setAlert({ open: true, type: 'success', message: 'Success' });
    } catch (err: any) {
      setErrText(err.toString());
    }
  };

  return (
    <>
      <Card variant='outlined' className='auth-form'>
        <Typography
          variant='h1'
          style={{ textAlign: 'center', fontSize: 30 }}
          sx={{ mb: 4 }}
        >
          Create user
        </Typography>
        <Typography
          variant='body1'
          color='red'
          sx={{ mb: 4 }}
          display={errText.length !== 0 ? 'block' : 'none'}
        >
          {errText}
        </Typography>
        <Box
          component='form'
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 3,
          }}
        >
          <FormControl variant='outlined'>
            <InputLabel htmlFor='username'>Login</InputLabel>
            <OutlinedInput
              id='login'
              name='login'
              required
              label='login'
              value={login}
              onChange={(event) => setLogin(event.target.value)}
            />
          </FormControl>

          <FormControl variant='outlined'>
            <InputLabel htmlFor='password'>Password</InputLabel>
            <OutlinedInput
              id='password'
              name='password'
              type='text'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='generate password'
                    onClick={generateRandomPassword}
                    edge='end'
                  >
                    <Casino />
                  </IconButton>
                </InputAdornment>
              }
              label='Password'
            />
          </FormControl>

          <Button
            type='submit'
            variant='contained'
            sx={{ width: 250, height: 50, alignSelf: 'center' }}
          >
            Create
          </Button>
        </Box>
      </Card>
      <CustomAlert data={alert} onClose={() => setAlert({ open: false })} />
    </>
  )
};

export default CreateUser;
