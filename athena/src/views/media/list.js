import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { Dropzone, Navbar, Icon, InputGroup, InputGroupAddon, Button } from 'goodlook';
import { Input } from 'goodlook/edits';
import { graphql, withApollo } from 'react-apollo';
import { withNotifications } from '../notification-provider';
import { getImages, getTags, getColors } from './utils';
import superagent from 'superagent';
import './folder.less';

export const OptionalLink = ({ to, onClick, arg, ...rest }) => {
  if (to && typeof to === 'function') return <Link {...rest} to={to(arg)} />;
  else if (to) return <Link {...rest} to={to} />;
  else return <a href="javascript:;" onClick={() => onClick(arg)} {...rest} />;
};

const attributes = 'id, url, tags, colors, width, height';
@withNotifications
@withApollo
 /* eslint-disable no-undef */
@graphql(gql`
  query fileList {
    items: fileList {
      ${attributes}
    }
  }
`, { /* eslint-disable */
  options: () => ({ pollInterval: 5000 }),
})
export default class MediaList extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    upload: PropTypes.func,
    imageLink: PropTypes.func,
    tagLink: PropTypes.func,
    onImageChange: PropTypes.func,
    onTagChange: PropTypes.func,
    showSuccess: PropTypes.func,
  }

  static defaultProps = {
    buttons: [],
  }

  state = {
    color: null,
    tag: null,
    text: null,
  };

  onUploadClick = () => {
    const { dropzone } = this.refs;
    dropzone.open();
  }

  render() {
    const { loading, items } = this.props.data;
    const { onImageChange, onTagChange, tagLink, imageLink, tag, search, buttons, inplace } = this.props;
    const { color, text } = this.state;

    if (loading) return <div></div>;
    const colors = getColors(items).map(({ color, count }) => (
      <a
        key={color} href="javascript:;" className="ui circular label"
        style={{ backgroundColor: color, color: (color === 'white') ? '#000' : '#FFF' }}
        onClick={() => this.setState({ color })}
      >{count}</a>
    ));

    const tags = getTags(items).map(item => (
      <div key={item.tag} className="card card-block" style={{float: 'left', height: '100px', width: '100px', margin: '5px', position: 'relative', padding: '15px', paddingTop: 0}}>
        <OptionalLink arg={item} onClick={onTagChange} to={tagLink} style={{
            position: 'absolute',
            textAlign: 'center',
            zIndex: 1,
            top: '55%',
            left: '50%',
            maxWidth: '90%',
            maxHeight: '90%',
            transform: 'translate(-50%, -50%)',
          }}>
          <h6>{item.tag}</h6>
        </OptionalLink>
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            height: '90%'}}>
          {item.items.map(({ id, url }) => (
            <img key={id} src={getResizedUrl(url, { width: 100, height: 100 })} style={{
              display: 'inline-block',
              width:'30%', height: '30%'}}
            />
          ))}
        </div>
      </div>
    ));

    const images = getImages(items, { color, text, tag }).map(item => ({
      ...item,
      src: item.url,
      thumbnail: getResizedUrl(item.url, { maxWidth: 500, maxHeight: 500 }),
      thumbnailWidth: 100,
      thumbnailHeight: 100*(item.height/item.width),
      caption: item.comment
    })).map(item => (
      <OptionalLink key={item.id} className="card card-block" arg={item} onClick={onImageChange} to={imageLink} style={{float: 'left', height: '100px', width: '100px', margin: '5px'}}>
        <img src={item.thumbnail} style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '90%',
          maxHeight: '90%',
          height: 'inherit !important'}}
        />
      </OptionalLink>
    ));

    return (
      <div>
        <Navbar color="faded" light>
          {!inplace ? <Navbar.Brand>
            Mediathek
          </Navbar.Brand> : null}
          <Navbar.Nav navbar>
            <Navbar.Item>
              <ol className="breadcrumb" style={{ marginBottom: 0, padding: '.4rem 1rem' }}>
                <li className="breadcrumb-item">
                  {tag ? (
                    <OptionalLink onClick={onTagChange} to={tagLink}>Alle Bilder</OptionalLink>
                  ) : 'Alle Bilder'}
                </li>
                {tag ? <li className="breadcrumb-item active">
                  {tag}
                </li> : null}
              </ol>
            </Navbar.Item>
          </Navbar.Nav>
          <Navbar.Nav className="pull-right" navbar>
            {/*<Navbar.Item>
              <Navbar.Link data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="true">
                Filter
              </Navbar.Link>
            </Navbar.Item>*/}
            {buttons.map((button, index) => <Navbar.Item key={index}>{button}</Navbar.Item>)}
            <Navbar.Item>
              <Navbar.Link className="btn btn-primary" href="javascript:;" onClick={this.onUploadClick}>
                <Icon name="upload" space />
                Upload
              </Navbar.Link>
            </Navbar.Item>
          </Navbar.Nav>
          <Navbar.Form role="search">
            <InputGroup>
              <Input placeholder="Suchen ..." value={text} onChange={text => this.setState({ text })} />
              {text ? <span className="input-group-btn">
                <Button onClick={() => this.setState({ text: null })}>
                  <i className="fa fa-times"/>
                </Button>
              </span> : null}
            </InputGroup>
          </Navbar.Form>
        </Navbar>
        <Dropzone onDrop={this.upload} ref="dropzone">
          <div style={{padding: '15px'}}>
            {!tag ? tags : null}
            {images}
          </div>
        </Dropzone>
      </div>
    );
  }

  upload = ({ files }) => {
    const { onImageChange, showSuccess, client } = this.props;

    const notification = showSuccess(
      'Upload', 'Datei(en) werden hochgeladen ...',
      { autoDismiss: false }
    );
    return client.query({
      query: gql`query cloudinaryRequest { cloudinaryRequest { apiKey, url, signature, timestamp } }`,
      forceFetch: true,
    }).then(({ data }) => {
      const cloudinary = data.cloudinaryRequest;
      const request = superagent
        .post(cloudinary.url)
        .on('progress', ({ percent }) => notification.update(`Datei(en) werden hochgeladen (${percent}%)`))
        .field('api_key', cloudinary.apiKey)
        .field('signature', cloudinary.signature)
        .field('timestamp', cloudinary.timestamp);
      [].slice.call(files).forEach(file => request.attach('file', file));
      return request;
    }).then(items => {
      notification.remove();
      this.props.data.refetch();
      if (onImageChange) onImageChange(items[0]);
    }).catch(err => {
      notification.remove();
      console.error(err);
    });
  }
}

// http://res.cloudinary.com/demo/image/upload/w_250,h_250,c_fit/sample.jpg
const getResizedUrl = (url, { maxWidth, maxHeight, width, height, cropX, cropY, cropW, cropH }) => {
  let part = '';
  if (cropX !== undefined && cropY !== undefined) {
    part = `x_${cropX},y_${cropY},w_${cropW},h_${cropH},c_crop`
      + (width ? `w_${width},h_${height},c_fill` : '');
  }

  if (width !== undefined && height !== undefined) {
    part = `w_${width},h_${height},c_fill`;
  }

  if (maxWidth !== undefined && maxHeight !== undefined) {
    part = `w_${maxWidth},h_${maxHeight},c_fit`;
  }

  if (!part) {
    part = 'c_fill,q_75,e_vibrance:33';
  }

  return url.replace('/upload/', `/upload/${part}/`);
}
