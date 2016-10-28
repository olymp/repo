import React, { Component, PropTypes } from 'react';
import Image from './cool-image';
import withImageUpload from './with-image-upload';
import withLightbox from './with-lightbox';

const defaultImage = { url: `${CDN_URL}/img/placeholder.jpg`, width: 1680, height: 578 };
@withImageUpload({ inplace: true })
@withLightbox()
export default class ImageComponent extends Component {
  static defaultProps = {
    value: null,
    round: false,
    readOnly: false,
    fadeIn: true,
  };

  render() {
    const { value, showLightbox, showMediathek, readOnly, className, children, width, height } = this.props;
    const image = value || defaultImage;

    const cornerButton = !readOnly ? (
      <a className="ui yellow right corner label" href="javascript:;" onClick={showMediathek}>
        <i className="icon picture" style={{ pointerEvents: 'none' }} />
      </a>
    ) : null;

    return (
      <Image image={image} width={width} height={height} className={className} onClick={showMediathek}>
        {cornerButton}
        {children}
      </Image>
    );
  }
}
