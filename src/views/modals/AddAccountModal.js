import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { apiService } from '../../services/ApiService';

export default function AddAccountModal(props) {
  const [email = '', setEmail] = useState();
  const [pass = '', setPass] = useState();
  const [gauth = '', setGauth] = useState();
  const [proxyIp = '', setProxyIp] = useState();
  const [proxyPort = '', setProxyPort] = useState();
  const [proxyLogin = '', setProxyLogin] = useState();
  const [proxyPass, setProxyPass] = useState();
  //   const [shouldRun = false, setShouldRun] = useState();

  const handleInputEmail = (event) => {
    setEmail(event.target.value);
  };

  const handleInputPass = (event) => {
    setPass(event.target.value);
  };

  const handleInputGauth = (event) => {
    setGauth(event.target.value);
  };

  const handleInputProxyIp = (event) => {
    setProxyIp(event.target.value);
  };

  const handleInputProxyPort = (event) => {
    setProxyPort(event.target.value);
  };

  const handleInputProxyLogin = (event) => {
    setProxyLogin(event.target.value);
  };

  const handleInputProxyPass = (event) => {
    setProxyPass(event.target.value);
  };

  const handleInputShouldRun = (event) => {
    setShouldRun(event.target.checked);
  };

  const handleInputStrategy = (event) => {
    setStrategy(event.target.value);
  };

  const handleInputScheduler = (event) => {
    setScheduler(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = {
      email,
      password: pass,
      gAuthSecret: gauth,
      proxyIp,
      proxyPort,
      proxyLogin,
      proxyPass,
    };
    await apiService.createAccount(data);
    props.onHide();
  };

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Добавить аккаунт
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
              type="email"
              value={email}
              onChange={handleInputEmail}
              placeholder="Enter email"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Control
              type="password"
              value={pass}
              onChange={handleInputPass}
              placeholder="Password"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={gauth}
              onChange={handleInputGauth}
              placeholder="GAUTH"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={proxyIp}
              onChange={handleInputProxyIp}
              placeholder="Proxy ip"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={proxyPort}
              onChange={handleInputProxyPort}
              placeholder="Proxy port"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={proxyLogin}
              onChange={handleInputProxyLogin}
              placeholder="Proxy login"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Control
              type="password"
              value={proxyPass}
              onChange={handleInputProxyPass}
              placeholder="Proxy password"
            />
          </Form.Group>
          {/* <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={backups}
              onChange={handleInputBackups}
              placeholder="Backups"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={notes}
              onChange={handleInputNotes}
              placeholder="Notes"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Select onChange={handleInputPlatform}>
              <option>Platform</option>
              <option value="PSN">PSN</option>
              <option value="XBOX">XBOX</option>
              <option value="PC">PC</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={profile}
              onChange={handleInputProfile}
              placeholder="Profile ID"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={scheduler}
              onChange={handleInputScheduler}
              placeholder="Scheduler config"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={strategy}
              onChange={handleInputStrategy}
              placeholder="Strategy config"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check
              onClick={handleInputShouldRun}
              value={shouldRun}
              type="checkbox"
              label="Should run"
            />
          </Form.Group> */}
          <div className="d-grid gap-2">
            <Button className="modalButton" variant="primary" type="submit">
              Создать
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
