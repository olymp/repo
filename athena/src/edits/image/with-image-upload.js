import React, { Component, PropTypes } from 'react';
import { Modal } from 'goodlook';
import MediaModal from '../../components/media-modal';
import MediaList from '../../views/media/wrappers/media-state';
import MediaCropper from '../../components/media-modal/modal-crop';
import { Dropzone, Navbar, Icon, InputGroup, InputGroupAddon, Button } from 'goodlook';

const defaultGetImage = props => props.value;
export default ({ getImage, inplace } = {}) => WrappedComponent => class WithImageUpload extends Component {
  state = { };
  show = ({ image }) => {
    this.setState({ visible: image || true });
  };

  hide = () => {
    this.setState({ visible: false });
  };

  change = v => {
    const { onChange } = this.props;
    onChange({
      url: v.url,
      height: v.height,
      width: v.width,
      crop: v.crop,
    });
    this.hide();
  };

  buffer = v => {
    this.v = v;
  };

  render() {
    if (this.props.disableUpload || this.props.readOnly) {
      return <WrappedComponent {...this.props} />;
    }

    const { visible } = this.state;
    const image = (getImage || defaultGetImage)(this.props);

    if (inplace) {
      const save = (
        <Navbar.Link key={0} className="btn btn-primary" href="javascript:;" onClick={() => this.change(this.v)}>Speichern</Navbar.Link>
      );
      const cancel = (
        <Navbar.Link key={1} className="btn btn-secondary" href="javascript:;" onClick={this.hide}>Abbruch</Navbar.Link>
      );
      if (visible && typeof visible === 'object') {
        return <MediaCropper inplace buttons={[cancel, save]} image={visible} onChange={image => !image ? this.show({ }) : this.buffer(image)} />;
      } else if (visible) {
        return <MediaList inplace buttons={[cancel]} onClick={image => this.show({ image })} />;
      } else {
        return <WrappedComponent {...this.props} showMediathek={() => this.show({ image })} />;
      }
    } else {
      return (
        <WrappedComponent {...this.props} showMediathek={this.show}>
          {this.props.children}
          {visible ? <Modal close={this.hide}>
            <MediaModal value={image} onChange={this.change} onClose={this.hide} />
          </Modal> : null}
        </WrappedComponent>
      );
    }
  }
}
