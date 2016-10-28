import React, { Component, PropTypes } from 'react';
import { withApollo, graphql } from 'react-apollo';
import { withNotifications } from '../../notification-provider';
import { withItem } from '../../item-provider';

const attributes = 'id, height, width, url, type, colors, tags';
const withFileWrapper = WrappedComponent => {
  @withNotifications
  @withApollo
  /* eslint-disable no-undef */
  @graphql(gql`
    query getFileById($id:String!) {
      file(id:$id) {
        ${attributes}
      }
    }
  `, {
    options: ({ id, routeParams }) => ({
      variables: {
        id: id || routeParams.id,
      },
    }),
  })
  @withItem({ name: 'file', attributes })
  class WithFileComponent extends Component {
    render() {
      return <WrappedComponent {...this.props} />;
    }
  } return WithFileComponent;
};

export const withFile = withFileWrapper;
