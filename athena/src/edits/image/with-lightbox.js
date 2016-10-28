import React, { Component, PropTypes } from 'react';
import { Lightbox } from 'goodlook';

const defaultGetImage = props => props.value;
export default ({ getImage } = {}) => WrappedComponent => class WithLightbox extends Component {
  state = {};
  show = () => {
    this.setState({ visible: true });
  };

  hide = () => {
    this.setState({ visible: false });
  };

  render() {
    if (this.props.disableLightbox) {
      return <WrappedComponent {...this.props} />;
    }

    const { caption, children, readOnly } = this.props;
    const { visible } = this.state;
    const image = (getImage || defaultGetImage)(this.props);
    const { url, mime } = (image ? image.url : null) || {};

    return (
      <WrappedComponent {...this.props}>
        {children}
        <Lightbox visible={visible} src={url} caption={caption} images={[{ src: url }]} close={this.hide} />
      </WrappedComponent>
    );
  }
}
