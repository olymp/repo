import React, { Component, PropTypes, Children } from 'react';
import { withRouter } from 'react-router';
import { Notification, Sidebar, LoadingScreen } from 'goodlook';
import './container.less';
import { head } from 'powr/modules/react/helmet';
import { graphql } from 'react-apollo';
import { userProvider } from './user-provider';
import { AccountRegister, AccountLogin, AccountConfirm, AccountReset, AccountForgot, AccountInvite } from './account';
import SettingsPage from './pages/settings/page';
import { MediaModal } from './media';
import { CollectionDetail, CollectionSchema } from './collections';
import { GatewayProvider, GatewayDest } from 'react-gateway';
import capitalize from 'capitalize';

const { SidebarItem, SidebarAvatar } = Sidebar;

@withRouter
@userProvider
@head(() => ({
  title: `Admn`,
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
  ],
  styles: [
    `/css/bootstrap.min.css`,
    `/css/font-awesome.min.css`,
  ],
}))
@graphql(gql`
  query schema {
    schema: __schema {
      types {
        name
        description
        interfaces {
          name
        }
        fields {
          name
          type {
            kind
            name
          }
        }
      }
    }
  }
`, {
  options: ({ userIsLoading, user }) => ({
    skip: !userIsLoading && !user,
  }),
  props: ({ ownProps, data: { loading, ...rest } }) => {
    return {
      data: {
        ...rest,
        loading: ownProps.userIsLoading === false && !ownProps.user ? false : loading,
      },
    };
  },
})
export default class Container extends Component {
  static propTypes = {
    router: PropTypes.object.isRequired,
    user: PropTypes.object,
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    children: PropTypes.node,
    data: PropTypes.object,
  }

  isActive = href => {
    const { pathname } = this.props.location;
    if (href === pathname) return true;
    if (pathname.indexOf(`${href}/`) === 0) return true;
    return false;
  }

  renderCollectionNav = ({ name, label, description }) => {
    const link = `/c/data/${name}`;
    return (
      <SidebarItem key={name} icon={description.split('icon:')[1]} text={capitalize(name)} link={link} active={this.isActive(link)} />
    );
  }

  render() {
    const { children, router, user, location, params, logout } = this.props;
    const { pathname, query } = location;
    const { schema, loading } = this.props.data;

    let modal;
    if (query.confirm !== undefined) modal = <AccountConfirm token={query.confirm} pathname={pathname} onClose={() => router.push({ ...location, query: { } })} />;
    if (query.register !== undefined) modal = <AccountRegister email={query.register} pathname={pathname} onClose={() => router.push({ ...location, query: { } })} />;
    if (query.login !== undefined) modal = <AccountLogin email={query.email} pathname={pathname} onClose={() => router.push({ ...location, query: { } })} />;
    if (query.forgot !== undefined) modal = <AccountForgot email={query.forgot} pathname={pathname} onClose={() => router.push({ ...location, query: { } })} />;
    if (query.reset !== undefined) modal = <AccountReset token={query.reset} pathname={pathname} onClose={() => router.push({ ...location, query: { } })} />;

    if (!user) {
      return (
        <div className="full">
          <Notification />
          {modal}
          {children}
        </div>
      );
      return Children.only(children);
    }

    const collections = schema && schema.types ? schema.types.filter(x => (x.interfaces || []).filter(y => y.name === 'CollectionType' || y.name === 'CollectionInterface').length) : [];
    const collection = (collections || []).filter(c => query[c.name] !== undefined)[0];
    const colSchema = query.schema ? (collections || []).filter(c => c.name === query.schema)[0] : null;
    if (collection !== undefined) {
      const { name } = collection;
      modal = <CollectionDetail name={name} id={query[name]} onClose={() => router.push(pathname)} />;
    } else if (query.media !== undefined) {
      modal = <MediaModal id={query.media} onClose={() => router.push({ pathname, query: { ...query, media: undefined } })} />;
    } else if (colSchema) {
      modal = <CollectionSchema id={colSchema.id} name={colSchema.name} onClose={() => router.push({ pathname, query: { ...query, schema: undefined } })} />;
    } else if (query.createPage !== undefined) {
      modal = (
        <SettingsPage
          initialData={{ parentId: query.createPage, order: 0 }}
          attributes="id, slug, order, name, parentId, blocks, templateName"
          onClose={() => router.push({ pathname, query: { ...query, createPage: undefined } })}
        />
      );
    }

    return (
      <GatewayProvider>
        <div className="full">
          {/*loading ? <LoadingScreen /> : null*/}
          {modal}
          <Notification />
          <Sidebar>
            <SidebarAvatar name={user ? (user.nickname || user.name) : ''} link="/c/user" active={this.isActive('/c/user')} image={user ? user.picture : null} />
            <SidebarItem icon="home" text="Website" link="/" active={location.pathname === '/' || !!params.splat} />
            {(collections || []).map(this.renderCollectionNav)}
            <SidebarItem icon="picture-o" text="Mediathek" link="/c/media" active={this.isActive('/c/media')} />
            {/*<SidebarItem icon="user-secret" text="Benutzer" isBottom href="https://sandbox-eu.it.auth0.com/api/run/admn/8d6f0f0711daedc87d1a6d595771015a" active={this.isActive('/c/users')} />*/}
            <SidebarItem icon="area-chart" text="Analytics" isBottom link="/c/analytics" active={this.isActive('/c/analytics')} />
            <SidebarItem icon="envelope-o" text="E-Mail" isBottom link="/c/email" active={this.isActive('/c/email')} />
            <SidebarItem icon="question" text="Hilfe" isBottom link="/c/help" active={this.isActive('/c/help')} />
            <SidebarItem icon="search" text="Suche" isBottom link="/c/search" active={this.isActive('/c/search')} />
            <SidebarItem icon="power-off" text="Abmelden" isBottom onClick={logout} />
          </Sidebar>
          {children}
          <GatewayDest name="global" />
        </div>
      </GatewayProvider>
    );
  }
}

const lowerCase0 = value => {
  return value.charAt(0).toLowerCase() + value.slice(1);
};
