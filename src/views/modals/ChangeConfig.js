import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { apiServiceCustomResolvers } from '../../services/ApiCustomResolvers';

export default function ChangeConfigModal(props) {
  const [maxTimeToTrySbc = '', setMaxTimeToTrySbc] = useState();
  const [sbcDuration = '', setSbcDuration] = useState();
  const [shouldTrySbc = false, setShouldTrySbc] = useState();

  const handleInputMaxTimeToTrySbc = (event) => {
    setMaxTimeToTrySbc(event.target.value);
  };

  const handleInputSbcDuration = (event) => {
    setSbcDuration(event.target.value);
  };

  const handleInputShouldTrySbc = (event) => {
    setShouldTrySbc(event.target.checked);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const accountIds = props.accounts.map((acc) => acc.id);
    const data = {
      maxTimeToTrySbc: Number(maxTimeToTrySbc),
      sbcDuration: Number(sbcDuration),
      shouldTrySbc: shouldTrySbc,
    };
    await apiServiceCustomResolvers.changeConfig({
      account_ids: accountIds,
      config: data,
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
          Изменить конфиг воркера
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              type="number"
              value={maxTimeToTrySbc}
              onChange={handleInputMaxTimeToTrySbc}
              placeholder="Max time to try sbc (min)"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="number"
              value={sbcDuration}
              onChange={handleInputSbcDuration}
              placeholder="Sbc duration (min)"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check
              onClick={handleInputShouldTrySbc}
              value={shouldTrySbc}
              type="checkbox"
              label="Should try sbc"
            />
          </Form.Group>
          <div className="d-grid gap-2">
            <Button className="modalButton" variant="primary" type="submit">
              Отправить
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
