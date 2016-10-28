import React, { Component, PropTypes } from 'react';

export const withNotifications = WrappedComponent => class withNotifications extends Component {
  render() {
    return <WrappedComponent {...all} {...this.props} />;
  }
};

export const showSuccess = (title, message, options = {}) => {
  return window.addNotification({
    message,
    level: 'success',
    title,
    ...options,
  });
};

export const showDanger = (title, message, options = {}) => {
  return window.addNotification({
    message,
    level: 'danger',
    title,
    ...options,
  });
};

const all = {
  showDanger,
  showSuccess,
  showError: showDanger,
};
