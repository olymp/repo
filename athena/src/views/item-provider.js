import React, { Component, PropTypes } from 'react';
import { withRouter } from 'react-router';
import { withApollo } from 'react-apollo';
import { withNotifications } from './notification-provider';

const capitalize = str => str.charAt(0).toUpperCase() + str.substr(1);

export const mutateItem = (client, name, { attributes }) => props => client.mutate({
  mutation: gql`
    mutation set_${name}($id:String, $type:OPERATION_TYPE!, $input:${name}Input!) {
      ${name}(id:$id, input:$input, operationType:$type) {
        ${attributes || 'id'}
      }
    }
  `,
  ...props,
});

export const removeItem = (id, name, client, { showSuccess, showDanger, onRemoved, attributes }) => {
  return mutateItem(client, name, { attributes })({
    variables: {
      id,
      type: 'REMOVE',
      input: {},
    },
    updateQueries: {
      [`${name}List`]: previousQueryResult => ({
        ...previousQueryResult,
        items: previousQueryResult.items.filter(x => x.id !== id),
      }),
    },
  }).then(({ data }) => {
    if (showSuccess) showSuccess('Gelöscht', 'Änderungen wurden gespeichert!');
    if (onRemoved) onRemoved(data, this.props);
  }).catch(err => {
    console.error(err);
    if (showDanger) showDanger('Fehler', 'Fehler beim Löschen!');
  });
};

export const saveItem = (body, name, client, { showSuccess, showDanger, onSaved, attributes, id }) => {
  return mutateItem(client, name, { attributes })({
    variables: {
      id,
      input: body,
      type: 'PATCH',
    },
    /*optimisticResponse1: {
      [name]: body,
    },*/
    updateQueries: !id ? {
      [`${name}List`]: (previousQueryResult, { mutationResult }) => {
        return {
          ...previousQueryResult,
          items: [...previousQueryResult.items, mutationResult.data[name]],
        };
      },
    } : {},
  }).then(({ data }) => {
    if (showSuccess) showSuccess('Gespeichert', 'Änderungen wurden gespeichert!');
    if (onSaved) onSaved(data, this.props);
  }).catch(err => {
    console.error(err);
    if (showDanger) showDanger('Fehler', 'Fehler beim Speichern!');
  });
};

export const WithItem = WrappedComponent => {
  @withRouter
  @withApollo
  @withNotifications
  class WithItemComponent extends Component {
    static propTypes = {
      attributes: PropTypes.string,
      showSuccess: PropTypes.func.isRequired,
      showDanger: PropTypes.func.isRequired,
      client: PropTypes.object.isRequired,
      onSaved: PropTypes.func,
      onRemoved: PropTypes.func,
      data: PropTypes.object,
      name: PropTypes.string,
    }
    constructor(props) {
      super();
      this.update(props);
    }
    state = {
      isDirty: false,
    };
    componentWillReceiveProps(props) {
      this.update(props, this.props);
    }
    componentWillUnmount() {
      this.unmount = true;
    }
    update = (nextProps, lastProps) => {
      let { name, client, attributes, initialData, id, slug } = nextProps;
      if (!lastProps || name !== lastProps.name || attributes !== lastProps.attributes || id !== lastProps.id || slug !== lastProps.slug || (nextProps.data && nextProps.data[name] !== lastProps.data[name])) {
        if (!attributes || !name) return;
        const capitalized = capitalize(name);
        if (nextProps.data) {
          this.patchedItem = { };
          this.data = nextProps.data[name];
        } else if (id) {
          client.query({
            query: gql`
              query get_${name}($id:String!) {
                ${name}(id:$id) {
                  ${attributes}
                }
              }
            `,
            variables: {
              id,
            },
          }).then(({ data }) => {
            this.data = data[name];
            this.patchedItem = { ...initialData, ...this.data };
            this.setState({
              isDirty: false,
            });
          });
        } else if (slug) {
          client.query({
            query: gql`
              query get_${name}($slug:String!) {
                ${name}(slug:$slug) {
                  ${attributes}
                }
              }
            `,
            variables: {
              slug,
            },
          }).then(({ data }) => {
            this.data = data[name];
            this.patchedItem = { ...initialData, ...this.data };
            this.setState({
              isDirty: false,
            });
          });
        } else {
          this.patchedItem = { ...initialData };
          this.data = { ...this.patchedItem };
        }
      }
    }
    refetch = attributes => {
      this.update({ ...this.props, attributes }, this.props);
    }
    patch = patch => {
      if (this.unmount) return;
      this.patchedItem = {
        ...this.patchedItem,
        ...patch,
      };
      this.data = { ...this.data, ...this.patchedItem };
      this.setState({
        isDirty: true,
      });
    }
    save = () => {
      const { showSuccess, showDanger, onSaved, name, client, attributes } = this.props;
      return saveItem(this.patchedItem, name, client, { id: this.data.id, showSuccess, showDanger, onSaved, attributes });
    }
    remove = () => {
      const { showSuccess, showDanger, onRemoved, name, client, attributes } = this.props;
      return removeItem(this.data.id, name, client, { showSuccess, showDanger, onRemoved, attributes });
    }
    render() {
      return <WrappedComponent {...this.state} {...this.props} item={this.data} patch={this.patch} save={this.save} remove={this.remove} />;
    }
  } return WithItemComponent;
};
export const withItem = ({ attributes, name }) => WrappedComponent => {
  @withRouter
  @withApollo
  @withNotifications
  class WithItemComponent extends Component {
    static propTypes = {
      attributes: PropTypes.string,
      showSuccess: PropTypes.func.isRequired,
      showDanger: PropTypes.func.isRequired,
      client: PropTypes.object.isRequired,
      onSaved: PropTypes.func,
      onRemoved: PropTypes.func,
      data: PropTypes.object,
      name: PropTypes.string,
    }
    static defaultProps = {
      name,
      attributes
    }
    constructor(props) {
      super();
      this.update(props);
    }
    state = {
      isDirty: false,
    };
    componentWillReceiveProps(props) {
      this.update(props, this.props);
    }
    componentWillUnmount() {
      this.unmount = true;
    }
    update = (nextProps, lastProps) => {
      let { name, client, attributes, initialData, id, slug } = nextProps;
      if (!lastProps || name !== lastProps.name || attributes !== lastProps.attributes || id !== lastProps.id || slug !== lastProps.slug || (nextProps.data && nextProps.data[name] !== lastProps.data[name])) {
        if (!attributes || !name) return;
        const capitalized = capitalize(name);
        if (nextProps.data) {
          this.patchedItem = { };
          this.data = nextProps.data[name];
        } else if (id) {
          client.query({
            query: gql`
              query get_${name}($id:String!) {
                ${name}(id:$id) {
                  ${attributes}
                }
              }
            `,
            variables: {
              id,
            },
          }).then(({ data }) => {
            this.data = data[name];
            this.patchedItem = { ...initialData, ...this.data };
            this.setState({
              isDirty: false,
            });
          });
        } else if (slug) {
          client.query({
            query: gql`
              query get_${name}($slug:String!) {
                ${name}(slug:$slug) {
                  ${attributes}
                }
              }
            `,
            variables: {
              slug,
            },
          }).then(({ data }) => {
            this.data = data[name];
            this.patchedItem = { ...initialData, ...this.data };
            this.setState({
              isDirty: false,
            });
          });
        } else {
          this.patchedItem = { ...initialData };
          this.data = { ...this.patchedItem };
        }
      }
    }
    refetch = attributes => {
      this.update({ ...this.props, attributes }, this.props);
    }
    patch = patch => {
      if (this.unmount) return;
      this.patchedItem = {
        ...this.patchedItem,
        ...patch,
      };
      this.data = { ...this.data, ...this.patchedItem };
      this.setState({
        isDirty: true,
      });
    }
    save = () => {
      const { showSuccess, showDanger, onSaved, name, client, attributes } = this.props;
      //return saveItem(this.patchedItem, name, client, { id: this.data.id, showSuccess, showDanger, onSaved, attributes });
      return saveItem(this.data, name, client, { id: this.data.id, showSuccess, showDanger, onSaved, attributes });
    }
    remove = () => {
      const { showSuccess, showDanger, onRemoved, name, client, attributes } = this.props;
      return removeItem(this.data.id, name, client, { showSuccess, showDanger, onRemoved, attributes });
    }
    render() {
      return <WrappedComponent {...this.state} {...this.props} item={this.data} patch={this.patch} save={this.save} remove={this.remove} />;
    }
  } return WithItemComponent;
};
