import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const Auth = () => {
  const [secret, setSecret] = useState('');
  const [rabbitUrl, setRabbitUrl] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    localStorage.setItem('adminSecret', secret);
    localStorage.setItem('rabbitUrl', rabbitUrl);
    window.location.href = '/main';
  };

  return (
    <div>
      <Form className="Form" noValidate onSubmit={handleLogin}>
        <Form.Group className="mb-3">
          <Form.Label>Enter admin secret</Form.Label>
          <Form.Control
            type="text"
            onChange={(e) => setSecret(e.target.value)}
            value={secret}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Enter rabbit URL</Form.Label>
          <Form.Control
            type="text"
            onChange={(e) => setRabbitUrl(e.target.value)}
            value={rabbitUrl}
          />
        </Form.Group>

        <div className="d-grid gap-2">
          <Button className="modalButton" variant="primary" type="submit">
            Login
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Auth;
