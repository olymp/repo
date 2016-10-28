import React from 'react';
import { Route } from 'react-router';
import { Container, BackendContainer } from './views';
import { ErrorContainer, Error404 } from './views/error';
import { Page } from './views/pages';
import { Media, MediaDetail } from './views/media';
import { Collection } from './views/collections';
import Search from './views/search';
import Analytics from './views/analytics';
import { onEnter } from './views/user-provider';
// import { UserList, UserContainer } from "./views/user";

export default ({ routes, Website }) => (
  <Route component={Container}>
    <Route component={ErrorContainer}>
      <Route path="/error" component={Error404} />
    </Route>
    <Route component={BackendContainer}> { /*onEnter={onEnter}*/ }
      <Route path="/c/media" component={Media}>
        <Route path="/c/media/new" component={MediaDetail} />
        <Route path="/c/media/:id" component={MediaDetail} />
      </Route>
      {/* <Route path="/c/users" component={UserList}>
        <Route path="/c/user/:id"/>
      </Route>
      <Route path="/c/user" component={UserContainer}/>*/}
      <Route path="/c/data/:model" component={Collection}>
        <Route path="/c/data/:model/:id" />
      </Route>
      <Route path="/c/search" component={Search} />
      <Route path="/c/analytics" component={Analytics} />
    </Route>
    {routes}
    <Route component={Website}>
      <Route path="/" component={Page} />
      <Route path="/*" component={Page} />
    </Route>
    <Route component={ErrorContainer}>
      <Route path="*" component={Error404} />
    </Route>
  </Route>
);
