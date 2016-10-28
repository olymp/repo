import React, { Component, PropTypes } from 'react';
import { withApollo } from 'react-apollo';
import { saveItem, removeItem } from '../../item-provider';

const attributes = 'id, name, plural, icon, label, schema { name, label, type, value }';
const withCollectionWrapper = WrappedComponent => {
  @withApollo
  class WithCollectionComponent extends Component {
    static propTypes = {
      client: PropTypes.object.isRequired,
      attributes: PropTypes.string,
      name: PropTypes.string,
    }
    constructor(props) {
      super();
      this.update(props);
    }
    state = {};
    componentWillReceiveProps(props) {
      this.update(props, this.props);
    }
    componentWillUnmount() {
      this.unmount = true;
    }
    save = item => {
      return saveItem(item, 'collection', this.props.client, { id: item.id, attributes });
    }
    remove = id => {
      return removeItem(id, 'collection', this.props.client, { attributes });
    }
    update = (nextProps, lastProps) => {
      const { name, client, collection } = nextProps;
      if (!lastProps || name !== lastProps.name) {
        if (!name) return;
        this.collection = null;
        if (collection) {
          this.collection = collection;
        } else {
          client.query({ /* eslint-disable no-undef */
            query: gql`
              query getCollectionByName($name:String!) {
                collection(name:$name) {
                  ${attributes}
                }
              }
            `, /* eslint-disable */
            variables: { name },
          }).then(({ data }) => {
            this.collection = data.collection;
            this.setState({});
          });
        }
      }
    }
    render() {
      if (!this.collection) return null;
      const attribs = `id, ${this.collection.schema.map(field => {
        if (field.type !== 'one' && field.type !== 'many') return field.name;
        return `${field.name} { id }`;
      }).join(', ')}`;
      return <WrappedComponent
        {...this.props}
        collection={this.collection}
        collectionController={{save: this.save, remove: this.remove}}
        attributes={attribs}
      />;
    }
  } return WithCollectionComponent;
};

export const WithCollection = withCollectionWrapper;
export const withCollection = additionalProps => WrappedComponent => props => {
  const Comp = withCollectionWrapper(WrappedComponent);
  return <Comp {...props} {...additionalProps} />;
};
