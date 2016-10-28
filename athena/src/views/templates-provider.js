import React, { Component, PropTypes } from 'react';

export const withTemplates = WrappedComponent => class withTemplates extends Component {
  static contextTypes = {
    templates: React.PropTypes.object,
  };
  render() {
    return <WrappedComponent templates={this.context.templates} {...this.props} />;
  }
};
