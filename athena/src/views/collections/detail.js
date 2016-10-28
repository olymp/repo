import React, { Component, PropTypes } from 'react';
import { withApollo } from 'react-apollo';
import { purify, Modal, Button, FormGroup, Form, Label, Col, Accordion } from 'goodlook';
import * as Edits from 'goodlook/edits';
import Image from '../../edits/image';
import capitalize from 'capitalize';
import { WithItem } from '../item-provider';
import { withCollection } from './utils';
import shortId from 'shortid';
import cn from 'classnames';

@withApollo
class ApolloFormField extends Component {
  static contextTypes = {
    blocks: React.PropTypes.object,
  }
  resolveEditor(value) {
    let { name, type, client, patch } = this.props;
    if (type.kind === 'LIST' && type.ofType.name.indexOf('nested') === 0) {
      return (
        <Accordion remove={index => patch(value.filter((x, i) => i !== index))} style={{ marginBottom: '.25rem' }}>
          {value.map((row, index) => (
            <Accordion.Item key={index} className="card" label={({ children, active, ...rest }) => <div className="card-header" {...rest}>{row.name}{children}</div>}>
              <ApolloForm nested className="card-body p-b-0 p-x-1 p-t-1" name={type.ofType.name} item={row} patch={p => patch(value.map(x => x === row ? { ...row, ...p } : x))} />
            </Accordion.Item>
          ))}
        </Accordion>
      );
    } else if (type.kind === 'OBJECT' && type.name === 'image') {
      if (!value || !value.url) value = { url: `${CDN_URL}/img/placeholder.jpg`, width: 1680, height: 578 };
      return (
        <Image width="100%" value={value} onChange={patch} />
      );
    } else if (type.kind === 'OBJECT') {
      if (!value) value = {};
      return (
        <Accordion className="card">
          <Accordion.Item className="card-body" label={({ children, active, ...rest }) => <div className="card-header" {...rest}>{value.name}{children}</div>}>
            <ApolloForm nested className="card-body p-b-0 p-x-1 p-t-1" name={type.name} item={value} patch={p => patch({ ...value, ...p })} />
          </Accordion.Item>
        </Accordion>
      );
    } else if (type === 'one') {
      const fetch = () => client.query({
        query: gql`query get${value}List { items: ${value}List() { id, name } }`, /* eslint-disable-line no-undef */
        forceFetch: true,
      }).then(x => x.data.items);
      return (
        <Edits.Select2
          valueKey="id"
          labelKey="name"
          fetch={fetch}
          placeholder={type} value={value ? JSON.parse(JSON.stringify(value)) : null}
          updateValue={v => patch({ [name]: v || null })}
        />
      );
    } else if (type.name === 'many') {
      const fetch = () => client.query({
        query: gql`query get${value}List { items: ${value}List() { id, name } }`, /* eslint-disable-line no-undef */
        forceFetch: true,
      }).then(x => x.data.items);
      return (
        <Edits.Select2
          valueKey="id"
          labelKey="name"
          fetch={fetch}
          placeholder={type} value={value ? JSON.parse(JSON.stringify(value)) : null}
          multi
          updateValue={(v, v2) => patch({ [name]: v2 })}
        />
      );
    } else if (type.name === 'TimeRange') {
      return (
        <Edits.TimeRange value={value || ''} onChange={patch} />
      );
    } else if (type.name === 'Json') {
      return (
        <Edits.Slate value={value || ''} onChange={patch} className="form-control" blockTypes={this.context.blocks} />
      );
    } else if (type.name === 'Markdown') {
      return (
        <Edits.Input lines={5} placeholder={type.name} value={value || ''} updateValue={patch} />
      );
    } else if (type.name === 'Color') {
      return (
        <Edits.Color placeholder={type.name} value={value || ''} updateValue={patch} />
      );
    } else if (type === 'bool') {
      return (
        <Edits.Bool placeholder={type.name} value={value || ''} updateValue={patch} />
      );
    } else if (type === 'date') {
      return (
        <Edits.Date placeholder={type.name} value={value || ''} updateValue={patch} />
      );
    } return (
      <Edits.Input type="text" placeholder={type.name} value={value || ''} onChange={patch} />
    );
  }
  render() {
    let { name, type, value, patch, vertical } = this.props;
    // field.type.kind === 'LIST' && field.type.ofType.name.indexOf('nested') === 0
    if (type.kind === 'LIST' && type.ofType.name.indexOf('nested') === 0) {
      if (!value) value = [];
      return (
        <FormGroup row key={name}>
          <Label sm={3}>
            {toLabel(name)} <i className="fa fa-plus" onClick={() => patch([...value, { id: shortId.generate() }])} />
          </Label>
          <Col sm={9}>
            {this.resolveEditor(value)}
          </Col>
        </FormGroup>
      );
    } else if (vertical) {
      return (
        <FormGroup row key={name}>
          <Label sm={12}>{toLabel(name)}</Label>
          <Col sm={12}>
            {this.resolveEditor(value)}
          </Col>
        </FormGroup>
      );
    } else {
      return (
        <FormGroup row key={name}>
          <Label sm={3}>{toLabel(name)}</Label>
          <Col sm={9}>
            {this.resolveEditor(value)}
          </Col>
        </FormGroup>
      );
    }
  }
}

@withCollection
class ApolloForm extends Component {
  static defaultProps = {
    item: { },
  }
  render() {
    const { collection, item, nested, className, patch } = this.props;

    if (!collection) return null;

    const fields = collection.fields.filter(({ name }) => name !== 'id').reduce((state, item) => {
      const group = item.description && item.description.indexOf('detail:') !== -1 ? item.description.split('detail:')[1].split(' ')[0].split('\n')[0] : 'Allgemein';
      if (!state[group]) state[group] = [];
      state[group].push(item);
      return state;
    }, {});

    if (Object.keys(fields).length === 1) {
      return (
        <Form className={className}>
          {fields['Allgemein'].map(({ type, name }) =>
            <ApolloFormField key={name} type={type} name={name} value={item[name]} patch={value => patch({ [name]: value })} />
          )}
        </Form>
      )
    }

    return (
      <Form className={className}>
        <Accordion className="nav nav-tabs m-l-0 m-b-1" type="ul" tab initialIndex={0}>
          {Object.keys(fields).map(key =>
            <Accordion.Item key={key} label={({ children, active, onClick }) =>
              <li className="nav-item"><a onClick={onClick} href="javascript:;" className={cn('nav-link', {'active': active})}>{key}</a></li>
            }>
              <div className="tab-content">
                {fields[key].map(({ type, name }) =>
                  <ApolloFormField key={name} type={type} name={name} value={item[name]} patch={value => patch({ [name]: value })} />
                )}
              </div>
            </Accordion.Item>
          )}
        </Accordion>
      </Form>
    );
  }
}

@purify
@withCollection
@WithItem
export default class MainDetail extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    client: PropTypes.object.isRequired,
    patch: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
  }

  render() {
    const { children, onClose, name, routeParams, collection, item, save, patch } = this.props;

    if (!item) return null;

    const buttons = [
      <Button key="1" color="secondary" onClick={onClose}>Abbruch</Button>,
      <span key="1.5">&nbsp;</span>,
      <Button key="2" color="primary" onClick={() => save().then(onClose)}>Abschicken</Button>,
    ];

    return (
      <Modal size="lg" onClose={onClose} buttons={buttons}>
        {children}
        <ApolloForm collection={collection} patch={patch} item={item} />
      </Modal>
    );
  }
}

const toLabel = (x) => {
  const uml = x.replace(/ae/g, 'ä').replace(/oe/g, 'ö').replace(/ü/g, 'ue').replace(/Ae/g, 'Ä').replace(/Oe/g, 'Ö').replace(/Ue/g, 'Ü');
  const snake = uml.replace(/([A-Z])/g, ($1) => `-${$1}`);
  const capitalized = capitalize(snake);
  return capitalized;
};
