import React, { Component, PropTypes } from 'react';
import { withApollo } from 'react-apollo';
import { purify, Modal, Button, FormGroup, Form, Label, Col } from 'goodlook';
import AceEditor from '../../components/ace';
import * as Edits from 'goodlook/edits';
import { WithItem } from '../item-provider';
import { withCollection } from './utils';

@withApollo
@withCollection
@purify
export default class SchemaDetail extends Component {
  static propTypes = {
  }

  onChange = (x) => {
    console.log(x);
    this.body = x;
  }

  save = () => {
    const { collectionController, onClose } = this.props;
    collectionController.save(JSON.parse(this.body)).then(onClose);
  }

  remove = () => {
    const { collectionController, onClose } = this.props;
    collectionController.remove(this.props.collection.id).then(onClose);
  }

  render() {
    const { children, onClose, collection, item, collectionController } = this.props;

    const buttons = [
      <Button key="0" color="danger" onClick={this.remove}>Löschen</Button>,
      <span key="0.5">&nbsp;</span>,
      <Button key="1" color="secondary" onClick={onClose}>Abbruch</Button>,
      <span key="1.5">&nbsp;</span>,
      <Button key="2" color="primary" onClick={this.save}>Abschicken</Button>,
    ];

    return (
      <Modal title={collection.label} onClose={onClose} buttons={buttons} bodyStyle={{ padding: 0 }}>
        <Form>
          <AceEditor onChange={this.onChange} value={JSON.stringify(collection, null, 2)} width="100%" />
        </Form>
      </Modal>
    );
  }
}
