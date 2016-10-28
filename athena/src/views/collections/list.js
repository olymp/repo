import React, { Component, PropTypes } from 'react';
import { withRouter } from 'react-router';
import { withApollo } from 'react-apollo';
import { removeItem } from '../item-provider';
import capitalize from 'capitalize';
import { withNotifications } from '../notification-provider';

@withApollo
@withNotifications
@withRouter
export default class MainList extends Component {
  static propTypes = {
    collection: PropTypes.object.isRequired,
    client: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.items = [];
    this.state = {};
  }
  componentWillMount() {
    this.update(this.props);
  }
  componentWillReceiveProps(props) {
    this.update(props, this.props);
  }
  componentWillUnmount() {
    if (this.subscription) this.subscription.unsubscribe();
    this.unmount = true;
  }
  update = (nextProps, lastProps) => {
    if (!lastProps || nextProps.collection !== lastProps.collection) {
      if (this.subscription) this.subscription.unsubscribe();
      const { client, collection, attributes } = nextProps;
      this.items = [];

      const query = client.watchQuery({
        /* eslint-disable no-undef */
        query: gql`
          query ${collection.name}List {
            items: ${collection.name}List {
              ${attributes}
            }
          }
        `, /* eslint-disable */
      });
      this.subscription = query.subscribe({
        next: ({ data }) => {
          if (this.unmount) return;
          this.items = data.items;
          this.setState({});
        },
        error: (error) => {
          console.log('there was an error sending the query', error);
        },
      });
    }
  }

  resolveFieldValue(value, meta) {
    if (meta.type === 'one') {
      if (value) return value.name || 'Ja';
      return 'Null';
    } else if (meta.type === 'many') {
      if (value && value.length && value.map(x => x.name).join('').length > 0) return value.map(x => x.name).join(', ');
      if (value && value.length) return `${value.length} ${value.length > 1 ? 'Elemente' : 'Element'}`;
      return 'Keine Elemente';
    } else if (meta.type.kind === 'LIST') {
      if (value && value.length && value.map(x => x.name).join('').length > 0) return value.map(x => x.name).join(', ');
      if (value && value.length) return `${value.length} ${value.length > 1 ? 'Elemente' : 'Element'}`;
      return '';
    } else if (meta.type.kind === 'OBJECT') {
      return value ? (value.name || 'Ja') : '';
    } return value;
  }

  removeItem = (e, id) => {
    const { client, collection, showSuccess, showDanger } = this.props;
    e.stopPropagation();
    return removeItem(id, collection.name, client, { showSuccess, showDanger });
  }

  render() {
    const { onClick, collection } = this.props;
    const { items } = this;
    const fields = collection.fields.filter(({ description }) => description.indexOf('list:') !== -1);
    const headers = fields.map(field => (
      <th key={field.name}>
        {capitalize(field.name)}
      </th>
    ));
    const rows = items.map(x => (
      <tr key={x.id} style={{ cursor: 'pointer' }} onClick={() => onClick(x)}>
        {fields.map(field => (
          <td key={field.name}>
            {this.resolveFieldValue(x[field.name], field)}
          </td>
        ))}
        <td>
          <button className="btn btn-danger btn-sm" onClick={e => this.removeItem(e, x.id)}>
            <i className="fa fa-trash" />
          </button>
        </td>
      </tr>
    ));

    return (
      <table className="table table-hover table-sm">
        <thead>
          <tr>
            {headers}
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
}
