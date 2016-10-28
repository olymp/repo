import React, {Component, PropTypes} from 'react';
import { LoadingSpinner, purify } from 'goodlook';
import { Link } from 'react-router';
import { Input } from 'goodlook/edits';
import { Button, Modal, Form, FormGroup, Col, Label } from 'goodlook';
import { withUser } from '../user-provider';
import { withNotifications } from '../notification-provider';

@withUser
@withNotifications
export default class AccountReset extends Component {
  constructor(props){
    super(props);
    this.state = {
      email: props.email,
    };
  }
  save = () => {
    const { forgot, onClose, showSuccess, showDanger } = this.props;
    const { email } = this.state;
    forgot(email).then(user => {
      showSuccess('Reset erfolgreich abgeschickt', `Bitte die E-Mails checken.`);
      onClose();
    }).catch(err => {
      showDanger('Reset fehlgeschlagen', err.message);
    });
  }
  render() {
    const { onClose, pathname } = this.props;
    const { email } = this.state;

    const buttons = [
      <Link key="0" className="pull-left" style={{marginTop:'5px'}} to={{ pathname, query: { login: email || null } }}>Zurück zur Anmeldung</Link>,
      <span key="0.5">&nbsp;</span>,
      <Button key="1" color="secondary" onClick={onClose}>Abbruch</Button>,
      <span key="1.5">&nbsp;</span>,
      <Button key="2" disabled={!email} color="primary" onClick={this.save}>Abschicken</Button>,
    ];

    return (
      <Modal title="Passwort vergessen" buttons={buttons} onClose={onClose}>
        <Form>
          <FormGroup row>
            <Label sm={4}>E-Mail</Label>
            <Col sm={8}>
              <Input id="email" type="text" name="email" placeholder="max@mustermann.de" value={email || ''} onChange={v => this.setState({ email: v || null })} className="uk-width-1-1" />
            </Col>
          </FormGroup>
        </Form>
      </Modal>
    );
  }
}
