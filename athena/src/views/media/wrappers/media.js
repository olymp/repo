import React from 'react';
import MediaList from '../list';
import { withRouter } from 'react-router';

export default withRouter(({ location }) => (
  <MediaList
    tag={location.query.tag}
    tagLink={tag => ({ pathname: location.pathname, query: { ...location.query, tag: tag ? tag.tag : undefined } })}
    imageLink={image => ({ pathname: location.pathname, query: { ...location.query, media: image ? image.id : undefined } })}
  />
));
