import { Box, Button, Card, FormControl, FormLabel, TextField, Typography } from '@mui/material';

const Auth = () => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const requestData = {
      email: formData.get('email')!,
      password: formData.get('password')!,
    };
    console.log(requestData);

    const response = await fetch('localhost:3000/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });

    if(response.status === 200) {
      const data = await response.json();
      localStorage.setItem('sbc-panel-user-tkn', data.token)
      localStorage.setItem('sbc-panel-user-role', data.role)
    } else if(response.status === 401) {
      // @todo:
      return;
    } else {
      // @todo:
      return;
    }

    // @todo: 
    // redirect
  };

  // return (
  //   <div>
  //     <Form className="Form" noValidate onSubmit={handleLogin}>
  //       <Form.Group className="mb-3">
  //         <Form.Label>Enter admin secret</Form.Label>
  //         <Form.Control
  //           type="text"
  //           onChange={(e) => setSecret(e.target.value)}
  //           value={secret}
  //         />
  //       </Form.Group>
  //       <Form.Group className="mb-3">
  //         <Form.Label>Enter rabbit URL</Form.Label>
  //         <Form.Control
  //           type="text"
  //           onChange={(e) => setRabbitUrl(e.target.value)}
  //           value={rabbitUrl}
  //         />
  //       </Form.Group>

  //       <div className="d-grid gap-2">
  //         <Button className="modalButton" variant="primary" type="submit">
  //           Login
  //         </Button>
  //       </div>
  //     </Form>
  //   </div>
  // );

  return (
    <Card variant="outlined">
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
      >
        Sign in
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        // noValidate
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: 2,
        }}
      >
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <TextField
            id="email"
            type="email"
            name="email"
            placeholder="your@email.com"
            autoComplete="email"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color='primary'
            sx={{ ariaLabel: 'email' }}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="password">Password</FormLabel>
          <TextField
            name="password"
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="current-password"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color='primary'
          />
        </FormControl>
        <Button
          type="submit"
          fullWidth
          variant="contained"
        // onClick={validateInputs}
        >
          Sign in
        </Button>
      </Box>
    </Card>
  )
};

export default Auth;
