import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { apiServiceCustomResolvers } from '../../services/ApiCustomResolvers';

const ChangeConfigModal = (props) => {
  const [maxTimeToTrySbc, setMaxTimeToTrySbc] = useState('');
  const [sbcDuration, setSbcDuration] = useState('');
  const [shouldTrySbc, setShouldTrySbc] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const accountIds = props.accounts.map((acc) => acc.id);
    await apiServiceCustomResolvers.changeConfig({
      account_ids: accountIds,
      config: {
        maxTimeToTrySbc: Number(maxTimeToTrySbc),
        sbcDuration: Number(sbcDuration),
        shouldTrySbc,
      },
    });

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
          Change worker config
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              type="number"
              value={maxTimeToTrySbc}
              onChange={(event) => setMaxTimeToTrySbc(event.target.value)}
              placeholder="Max time to try SBC (min)"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="number"
              value={sbcDuration}
              onChange={(event) => setSbcDuration(event.target.value)}
              placeholder="SBC duration (min)"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check
              onChange={(event) => setShouldTrySbc(event.target.checked)}
              checked={shouldTrySbc}
              type="checkbox"
              label="Should try SBC"
            />
          </Form.Group>
          <div className="d-grid gap-2">
            <Button className="modalButton" variant="primary" type="submit">
              Send
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default ChangeConfigModal;