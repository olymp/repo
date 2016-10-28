import React, {Component, PropTypes} from 'react';
import {withRouter} from 'react-router';
import {withApollo, graphql} from 'react-apollo';
import {withNotifications} from './notification-provider';

export const withModalController = name => WrappedComponent => class withModalController extends Component {
  state = {isOpen: false, args: null};
  open = () => {
    this.setState({isOpen: true, args: null});
  }
  openWith = (args) => {
    this.setState({isOpen: true, args});
  }
  close = () => {
    this.setState({isOpen: false, args: null});
  }
  render() {
    const x = {
      [name]: {
        open: this.open,
        openWith: (args) => () => this.openWith(args),
        close: this.close,
        isOpen: this.state.isOpen
      }
    }
    return <WrappedComponent {...this.props} {...x}/>
  }
}
