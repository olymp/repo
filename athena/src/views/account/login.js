import React, { Component } from 'react';
import { Button, Modal, Form, FormGroup, Col, Label } from 'goodlook';
import { Link } from 'react-router';
import { Input } from 'goodlook/edits';
import { withUser } from '../user-provider';
import { withNotifications } from '../notification-provider';

@withUser
@withNotifications
export default class AccountLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: props.email,
      password: null,
    };
  }

  save = () => {
    const { login, onClose, showSuccess, showDanger } = this.props;
    const { email, password } = this.state;
    login(email, password).then(user => {
      showSuccess('Erfolgreich angemeldet', `Wilkommen, ${user.name}`);
      onClose();
    }).catch(err => {
      showDanger('Anmeldung fehlgeschlagen', err.message);
    });
  }

  render() {
    const { onClose, pathname } = this.props;
    const { email, password } = this.state;

    const buttons = [
      <Link key="0" className="pull-left" style={{marginTop:'5px'}} to={{ pathname, query: { forgot: email || null } }}>Passwort vergessen?</Link>,
      <span key="0.5">&nbsp;</span>,
      <Button key="1" color="secondary" onClick={onClose}>Abbruch</Button>,
      <span key="1.5">&nbsp;</span>,
      <Button key="2" disabled={!email || !password} color="primary" onClick={this.save}>Anmelden</Button>,
    ];

    return (
      <Modal title={'Anmelden'} buttons={buttons} onClose={onClose}>
        <Form>
          <FormGroup row>
            <Label sm={4}>E-Mail</Label>
            <Col sm={8}>
              <Input id="email" type="text" name="email" placeholder="max@mustermann.de" value={email || ''} onChange={v => this.setState({ email: v || null })} className="uk-width-1-1" />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={4}>Password</Label>
            <Col sm={8}>
              <Input id="password" type="password" name="password" placeholder="Passwort" value={password || ''} onChange={v => this.setState({ password: v || null })} className="uk-width-1-1" />
            </Col>
          </FormGroup>
        </Form>
      </Modal>
    );
  }
}
