import React, { Component, useRef } from 'react';
// import { apiService } from '../services/ApiService';
import { Navigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default class Auth extends Component {
  state = {
    id: '',
    userId: '',
    secret: '',
    archiveSecret: '',
    rabbitUrl: '',
  };

  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
    this.handleInputSecret = this.handleInputSecret.bind(this);
    this.handleInputArchiveSecret = this.handleInputArchiveSecret.bind(this);
    this.handleInputRabbit = this.handleInputRabbit.bind(this);
  }

  async handleInputSecret(event) {
    this.setState(() => {
      return { secret: event.target.value };
    });
  }

  async handleInputArchiveSecret(event) {
    this.setState(() => {
      return { archiveSecret: event.target.value };
    });
  }

  async handleInputRabbit(event) {
    this.setState(() => {
      return { rabbitUrl: event.target.value };
    });
  }

  async login(event) {
    event.preventDefault();
    localStorage.setItem('adminSecret', this.state.secret);
    localStorage.setItem('adminArchiveSecret', this.state.archiveSecret);
    localStorage.setItem('rabbitUrl', this.state.rabbitUrl);
    window.location.href = '/main';
  }

  async toMain() {}

  async componentDidMount() {
  }

  render() {
    return (
      <div>
        <Form className="Form" noValidate onSubmit={this.login}>
          <Form.Group className="mb-3">
            <Form.Label>Enter admin secret</Form.Label>
            <Form.Control
              type="text"
              onChange={this.handleInputSecret}
              value={this.state.secret}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Enter archive secret</Form.Label>
            <Form.Control
              type="text"
              onChange={this.handleInputArchiveSecret}
              value={this.state.archiveSecret}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Enter rabbit URL</Form.Label>
            <Form.Control
              type="text"
              onChange={this.handleInputRabbit}
              value={this.state.rabbitUrl}
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
  }
}
