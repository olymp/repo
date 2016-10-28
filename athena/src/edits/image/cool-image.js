import React, { Component, PropTypes } from 'react';
export default class CoolImage extends Component {
  getUrl(image, size) {
    let url = image.src || image.url;
    const width = typeof this.props.width === 'number' && !this.props.lightbox
      ? this.props.width
      : (size.width < 1920 ? size.width : 1920);
    const height = typeof this.props.height === 'number' && !this.props.lightbox
      ? this.props.height
      : Math.floor(size.height * (width / size.width));

    if (image && url) {
      let part;
      if (image.crop) {
        part = `x_${image.crop[2] || 0}`
          + `,y_${image.crop[3] || 0}`
          + `,w_${image.crop[0]}`
          + `,h_${image.crop[1]}`
          + ',c_crop/'
          + (width ? `w_${width},h_${height},c_fill` : '');
      } else if (width !== undefined && height !== undefined) {
        part = `w_${width},h_${height},c_fill`;
      } else {
        part = 'c_fill,q_75,e_vibrance:33';
      }


      url = url.replace('/upload/', `/upload/${part},q_${Math.floor(80 - (width - 192) / 1728 * 40)},fl_lossy/`);
      const preview = url.replace(part, `${part}/w_16,h_16,q_1,c_limit`);
      return { url, preview };
    }

    return { url: null, preview: null };
  }

  render() {
    const { height, width, image, className, style, children, getImageSize, params, colors, onClick } = this.props;
    const size = (getImageSize ? getImageSize(image) : null) || (image ? {
      width: image.crop ? image.crop[0] : image.width,
      height: image.crop ? image.crop[1] : image.height,
    } : null);
    const ratio = size.height / size.width;
    const { url, preview } = this.getUrl(image, size);

    const containerStyle = {
      width: width || '100%',
      height: height || 'auto',
      position: 'relative',
      zIndex: 1,
      ...style,
    };
    const ratioBox = {
      display: 'block',
      width: '100%',
      paddingTop: (ratio * 100) + '%',
    };
    const imageBox = {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      transition: 'opacity .5s ease-out',
      right: 0,
    };
    const overflowBox = {
      position: 'absolute',
      left: '-15px',
      right: '-15px',
      top: '-15px',
      bottom: '-15px',
    };
    const placeholderBox = {
      ...imageBox,
      ...overflowBox,
      backgroundRepeat: 'no-repeat',
      backgroundColor: colors && colors.length > 0 ? colors[0] : undefined,
      backgroundSize: 'cover',
      backgroundImage: `url('${preview}')`,
      WebkitFilter: 'blur(15px)',
      filter: 'blur(5px)',
    };

    return (
      <div style={containerStyle} className={className}>
        <div style={{ ...overflowBox }} />

        <div style={{ overflow: 'hidden', position: 'relative', width: containerStyle.width, height: containerStyle.height }}>
          <div style={ratioBox}></div>
          <img
            src={url}
            style={{ ...imageBox, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            onClick={onClick}
          />
          {children}
        </div>
      </div>
    );
  }
}
