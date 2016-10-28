import React, { Component, PropTypes } from 'react';
import { Modal, Lightbox } from 'goodlook';

const defaultImage = { url: 'https://fakeimg.pl/920x300/', width: 920, height: 300 };
export default class ImageComponent extends Component {
  static defaultProps = {
    value: null,
    round: false,
    readOnly: false,
    lightbox: false,
    fadeIn: true,
  };

  constructor(props) {
    super();

    this.state = {
      modalVisible: false,
      lightboxVisible: false,
      showImage: !props.fadeIn,
    };
  }

  componentDidMount() {
    /* if (this.props.fadeIn) {
     setTimeout(() => {
     this.setState({
     showImage: true
     })
     }, 1);
     }*/

    if (this.props.fadeIn) {
      this.setState({
        showImage: true,
      }); // todo: Was macht das hier eigentlich???
    }
  }

  getUrl(image, size) {
    const width = typeof this.props.width === 'number' && !this.props.lightbox
      ? this.props.width
      : (size.width < 1920 ? size.width : 1920);
    const height = typeof this.props.height === 'number' && !this.props.lightbox
      ? this.props.height
      : Math.floor(size.height * (width / size.width));

    // Getan um die Bildgröße zu reduzieren: Breite/Höhe an den Container angepasst (wenn lightbox nicht aktiv), falls dieser keine Zahl ist wieder wie vorher die Bildgröße genommen, allerdings maximal 1920 in der Breite und die Höhe dazu angepasst.
    // Außerdem die Qualität angepasst (bei großen Bilder 40%, bei kleinen etwas über 80%).
    // Die Endung .jpg durch .png sollte ersetzt werden, da .png unglaublich groß ist, besser ist allerdings "fl_lossy,f_auto", der das Bild optimal anpasst (schaut ob Transparenzen exisitieren und wählt das optimum)

    if (image && image.url) {
      let part;
      if (image.params && image.params.cropX !== undefined && image.params.cropY !== undefined) {
        part = `x_${image.params.cropX || 0}`
          + `,y_${image.params.cropY || 0}`
          + `,w_${image.params.cropW}`
          + `,h_${image.params.cropH}`
          + ',c_crop/'
          + (width ? `w_${width},h_${height},c_fill` : '');
      } else if (width !== undefined && height !== undefined) {
        part = `w_${width},h_${height},c_fill`;
      } else {
        part = 'c_fill,q_75,e_vibrance:33';
      }


      const url = image.url.replace('/upload/', `/upload/${part},q_${Math.floor(80 - (width - 192) / 1728 * 40)},fl_lossy/`);
      this.placeholder = url.replace(part, `${part}/w_16,h_16,q_1,c_limit`);
      // /w_16,h_16,c_limit
      return url;
    }

    return undefined;
  }

  showModal = () => {
    this.setState({ modalVisible: true });
  };

  hideModal = () => {
    this.setState({ modalVisible: false });
  };

  changeImageFromModal = v => {
    const { updateValue } = this.props;
    updateValue(v);
    this.setState({ modalVisible: false });
  };

  showLightbox = () => {
    if (this.props.lightbox) {
      this.setState({ lightboxVisible: true });
    }
  };

  hideLightbox = () => {
    this.setState({ lightboxVisible: false });
  };

  render() {
    const { modalVisible, lightboxVisible, showImage } = this.state;
    const { value, updateValue, readOnly, round, height, width, caption, cleanly, className, style, lightbox, getImageSize, children, id } = this.props;

    if (readOnly && !value) return null;

    const image = value || defaultImage;
    const size = getImageSize && getImageSize(value) ? getImageSize(value) : {
      height: image.params && image.params.cropH ? image.params.cropH : image.height,
      width: image.params && image.params.cropW ? image.params.cropW : image.width,
    };
    const ratio = size.height / size.width;
    const url = this.getUrl(value, size) || defaultImage.url;
    const placeholder = this.placeholder;

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
      cursor: !lightbox ? 'auto' : 'pointer',
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
      backgroundColor: value && value.colors && value.colors.length > 0 ? value.colors[0] : undefined,
      backgroundSize: 'cover',
      backgroundImage: `url('${placeholder}')`,
      WebkitFilter: 'blur(15px)',
      filter: 'blur(5px)',
    };

    if (cleanly) {
      return (
        <img src={url} className={className} style={style} width={containerStyle.width} height={containerStyle.height} />
      );
    }

    const cornerButton = !readOnly ? (
      <a className="ui yellow right corner label" href="javascript:;" onClick={this.showModal}>
        <i className="icon picture" style={{ pointerEvents: 'none' }} />
      </a>
    ) : null;

    const lightboxComponent = lightbox ? (
      <Lightbox visible={lightboxVisible} src={url} caption={caption} images={[{ src: url }]} close={this.hideLightbox} />
    ) : null;

    const imgComp = (
      <img src={url} style={{ ...imageBox, opacity: showImage ? 1 : 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        className={(round) ? 'ui circular image' : ''}
        width="100%" height="auto" onClick={this.showLightbox}
      />
    );

    return (
      <div id={id} style={containerStyle} className={className}>
        <div style={{ ...overflowBox }} />

        <div style={{ overflow: 'hidden', position: 'relative', width: containerStyle.width, height: containerStyle.height }}>
          <div style={ratioBox}></div>
          {cornerButton}
          {lightboxComponent}
          {children}
          {lightbox && readOnly && image.mime == 'application/pdf' ? (
            <span className="ui right corner blue label">
              <i className="file pdf outline icon"></i>
            </span>) : null}
          <div style={placeholderBox} />
          {lightbox && image.mime == 'application/pdf' ? (
            <a href={image.url.replace('.jpg', '.pdf')} target="_blank">{imgComp}</a>
          ) : imgComp}
        </div>
      </div>
    );
  }
}
// format={size.width/size.height}
