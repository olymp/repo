import React, { Component, PropTypes } from 'react';
import List from './list';
import { Link, withRouter } from 'react-router';
import { graphql, withApollo } from 'react-apollo';
import { Navbar } from 'goodlook';
import capitalize from 'capitalize';
import { withCollection } from './utils';

@withCollection
@withApollo
@withRouter
export default class Main extends Component {
  static propTypes = {
    collection: PropTypes.object,
    router: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  }
  onClick = row => {
    const { router, location, collection } = this.props;
    const { pathname } = location;
    router.push({ pathname, query: { [collection.name]: row.id } });
  }
  render() {
    const { location, collection, attributes } = this.props;
    const { pathname } = location;

    if (!collection) return null;
    const { label, name } = collection;

    return (
      <div>
        <Navbar color="faded" light>
          <Navbar.Brand>
            {capitalize(label || name)}
          </Navbar.Brand>
          <Navbar.Nav navbar className="pull-right">
            <Navbar.Item>
              <Navbar.Link className="dropdown-toggle">
                Veröffentlicht
              </Navbar.Link>
            </Navbar.Item>
            {/*<Navbar.Item>
              <Navbar.Link tag={Link} to={{ pathname, query: { schema: name } }}>
                Schema
              </Navbar.Link>
            </Navbar.Item>*/}
            <Navbar.Item>
              {/*<Navbar.Link target="_blank" tag={Link} to={DATAPIPE_URL + '/' + name}>
                Export
              </Navbar.Link>*/}
            </Navbar.Item>
            <Navbar.Item>
              <Navbar.Link className="btn btn-primary" tag={Link} to={{ pathname, query: { [name]: null } }}>
                Hinzufügen
              </Navbar.Link>
            </Navbar.Item>
          </Navbar.Nav>
          <Navbar.Form role="search">
            <input type="text" className="form-control" placeholder="Suchen ..." />
          </Navbar.Form>
        </Navbar>
        <List collection={collection} attributes={attributes} onClick={this.onClick} />
      </div>
    );
  }
}
