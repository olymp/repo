import React, { Component, PropTypes } from 'react';
import { purify } from 'goodlook';
import { Slate } from 'goodlook/edits';
import { Gateway } from 'react-gateway';
import { graphql } from 'react-apollo';
import { withUser } from '../user-provider';
import { withItem } from '../item-provider';
import { Link } from 'react-router';
import SettingsPage from './settings/page';

const attributes = 'id, slug, order, name, parentId, blocks, templateName';
@withUser
@graphql(gql`
  query getPageBySlug($slug:String!) {
    page(slug:$slug) {
      ${attributes}
    }
  }
`, {
  options: ({ routeParams, ...rest }) => {
    return {
      variables: {
        slug: `/${routeParams.splat || ''}`,
      },
    };
  },
})
@withItem({ name: 'page', attributes })
export default class Page extends Component {
  static contextTypes = {
    templates: React.PropTypes.object,
    blocks: React.PropTypes.object,
  }
  state = { toggle: false };

  render() {
    const { user, item, data, patch, save, remove, isDirty, location, router, routeParams } = this.props;
    const { templates, navigation, blocks } = this.context;

    if (!item) return null;

    const { Template, templateData, value } = getTemplate(item, templates);
    const readOnly = !user || !!item.computed;
    const { pathname, query } = location;

    let modal;
    if (query.editPage !== undefined) {
      modal = <SettingsPage attributes={attributes} data={data} onClose={() => router.push({ pathname, query: { ...query, editPage: undefined } })} />;
    }

    return (
      <Template {...this.props} templateData={templateData} page={item} navigation={navigation} user={user}>
        {modal}
        <Slate className="frontend-editor" readOnly={readOnly} value={value || null} onChange={blocks => patch({ blocks })} blockTypes={blocks} />
        {user && !item.computed ? <Gateway into="global">
          <div style={{ position: 'fixed', right: '15px', bottom: '15px', zIndex: 10 }}>
            <button className="btn btn-primary" onClick={save}>
              <i className="fa fa-save" /> Änderungen speichern
            </button>
            &nbsp;
            <Link to={{ ...location, query: { editPage: null } }} className="btn btn-primary">
              <i className="fa fa-cog" />
            </Link>
          </div>
        </Gateway> : null}
      </Template>
    );
  }
}

const EmptyTemplate = ({ children }) => <div>{children}</div>;
EmptyTemplate.propTypes = { children: PropTypes.node };
const getTemplate = (page, templates) => {
  let templateName = page ? page.templateName : null;
  if (!templateName) templateName = 'Default';

  const Template = templates && templates[templateName] ? templates[templateName] : EmptyTemplate;
  const templateData = {
    ...(page && page.template ? page.template.json : {}),
    ...(page && page.templateData ? page.templateData : {}),
  };
  return {
    Template,
    templateData,
    value: page ? page.blocks : null,
  };
};
