import React, { Component, PropTypes } from 'react';
import Main from './main';
import { graphql } from 'react-apollo';
import { withUser } from '../user-provider';
import unflatten from '../../utils/unflatten';

@withUser
@graphql(gql`
  query pageList {
    items: pageList {
      id,
      slug,
      aliasId,
      href,
      order,
      parentId,
      name
    }
  }
`, {
  props: ({ data }) => {
    if (!data.items) return { data };
    const pages = unflatten(data.items);
    const nav = {};
    Object.keys(pages).forEach(key => {
      const page = pages[key];
      if (!nav[page.menu || 'main']) nav[page.menu || 'main'] = [];
      nav[page.menu || 'main'].push(page);
    });
    data.navigation = nav;
    return { data };
  },
})
export default WrappedComponent => class AppWrapper extends Component {
  render() {
    const { children, data, ...rest } = this.props;
    const meta = {};

    if (rest.user || rest.userIsLoading) {
      return (
        <Main {...rest} navigation={data.navigation}>
          <WrappedComponent {...rest} navigation={data.navigation} meta={meta}>
            {children}
          </WrappedComponent>
        </Main>
      );
    } return (
      <WrappedComponent {...rest} navigation={data.navigation} meta={meta}>
        {children}
      </WrappedComponent>
    );
  }
};
