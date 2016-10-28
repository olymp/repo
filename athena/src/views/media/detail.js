import React, { Component } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { Input, Tags } from 'goodlook/edits';
import { FormGroup, Form, Label, Col } from 'goodlook';
import { Image } from '../../../edits';

const ratio = [3, 9];
export default class MediaDetail extends Component {
  render() {
    const { item, data, patch, save, remove } = this.props;
    console.log(item);
    if (data.loading) {
      return <div className="ui basic segment no-spacing-top loading" style={{ minHeight: '500px' }} />;
    }
    return (
      <Form>
        <FormGroup row>
          <Label sm={ratio[0]}>Author</Label>
          <Col sm={ratio[1]}>
            <Input value={item.author} updateValue={(v) => patch({ author: v })} />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label sm={ratio[0]}>Kommentar</Label>
          <Col sm={ratio[1]}>
            <Input value={item.comment} updateValue={(v) => patch({ comment: v })} />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label sm={ratio[0]}>Schlagworte</Label>
          <Col sm={ratio[1]}>
            <Tags value={item.tags} updateValue={(v) => patch({ tags: v })} />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label sm={ratio[0]}>Bild</Label>
          <Col sm={ratio[1]}>
            <Image value={item} width={200} lightbox="true" />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label sm={ratio[0]}>Informationen</Label>
          <Col sm={ratio[1]}>
            <ul className="dropdown-menu pos-stc inline">
              <li>Originalbezeichnung: {item.original}</li>
              <li>Auflösung (B x H): {item.width} x {item.height} px</li>
              <li>Größe: {(item.size / 1024).toFixed(2)} kB</li>
              <li>Letzte Änderung: {moment(item.updatedAt).format('D. MMMM YYYY, HH:mm')} Uhr</li>
            </ul>
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label sm={ratio[0]}>Nutzungen</Label>
          <Col sm={ratio[1]}>
            <ul className="dropdown-menu pos-stc inline">
              {renderFileUsages(item.usages)}
            </ul>
          </Col>
        </FormGroup>
      </Form>
    );
  }
}

const getLink = item => {
  let link = '/';
  const id = item.documentId || item.id;
  if (item.model === 'page') {
    link = `/ref/${id}`;
  } else if (item.model === 'media') {
    link = `/c/media/${id}`;
  } else if (item.model === 'user') {
    link = `/c/user/${id}`;
  } else if (item.model) {
    link = `/c/data/${item.model}/${id}`;
  } return link;
};

const renderFileUsages = usages => {
  return usages && usages.length ? usages.map(item => (
    <li key={`${item.model}-${item.documentId}`}>
      <Link to={getLink(item)}>{item.model} - {item.documentId}</Link>
    </li>
  )) : (
    <li>
      <a>Keine Nutzungen</a>
    </li>
  );
};
