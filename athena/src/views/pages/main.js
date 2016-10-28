import React, { Component, PropTypes } from 'react';
import { Link, withRouter } from 'react-router';
import { Tree, Modal } from 'goodlook';
import GeneralModal from './settings/general-modal';
import NewPageModal from './settings/new-page-modal';
import { withModalController } from '../modal-provider';
import './react-ui-tree.less';
import './main.less';

@withRouter
@withModalController('newPage')
@withModalController('general')
export default class Main extends Component {
  handleSort = ({ tree }) => {
    const { page } = this.props;
  }

  renderTreeNode = node => {
    const { newPage } = this.props;
    return (
      <div className="shortLink">
        <Link to={node.slug} activeClassName={'active'} className="hover-icon tree-node">
          {node.name}
          <span onClick={newPage.openWith({ parentId: node.id })} className="icon" href="javascript:;">
             <i className="icon plus" />
          </span>
        </Link>
      </div>
    );
  }

  renderNavGroup = key => {
    const { navigation, newPage } = this.props;
    const tree = navigation[key] || [];
    return (
      <div key={key}>
        <h5 className="ui sub disabled header hover-icon" style={{ marginBottom: '5px' }}>
          {key}
          <a onClick={newPage.open} className="icon" href="javascript:;" to="/new">
            <i className="icon plus" />
          </a>
        </h5>
        <h5 className="ui sub header" style={{ marginBottom: '5px', marginTop: 0 }}>
          <Tree dynamic tree={tree} onSort={this.handleSort} renderNode={this.renderTreeNode} filter={x => !x.computed} />
        </h5>
      </div>
    );
  }

  render() {
    const { navigation, children, newPage, general } = this.props;
    const meta = {};

    return React.Children.only(children);
    return (
      <div className="full">
        <div className="pages-main sub-sidebar">
          <div className="uk-panel uk-panel-box full">
            <h3 className="uk-panel-title">Nav side in panel</h3>
            <ul className="uk-nav uk-nav-side uk-nav-parent-icon" data-uk-nav="">
              <li className="uk-active"><a href="#">Active</a></li>
              <li className="uk-parent" aria-expanded="false">
                <a href="#">Parent</a>
                <div style={{ overflow: 'hidden', height: 0, position: 'relative' }} className="uk-hidden"><ul className="uk-nav-sub">
                  <li><a href="#">Sub item</a></li>
                  <li><a href="#">Sub item</a>
                    <ul>
                      <li><a href="#">Sub item</a></li>
                      <li><a href="#">Sub item</a></li>
                    </ul>
                  </li>
                </ul>
                </div>
              </li>
              <li className="uk-parent" aria-expanded="false">
                <a href="#">Parent</a>
                <div style={{ overflow: 'hidden', height: 0, position: 'relative' }} className="uk-hidden"><ul className="uk-nav-sub">
                  <li><a href="#">Sub item</a></li>
                  <li><a href="#">Sub item</a></li>
                </ul></div>
              </li>
              <li><a href="#">Item</a></li>
              <li className="uk-nav-header">Header</li>
              <li className="uk-parent"><a href="#"><i className="uk-icon-star"></i> Parent</a></li>
              <li><a href="#"><i className="uk-icon-twitter"></i> Item</a></li>
              <li className="uk-nav-divider"></li>
              <li><a href="#"><i className="uk-icon-rss"></i> Item</a></li>
            </ul>
          </div>
        </div>
        <div className="full with-sub-sidebar">
          {children}
        </div>
      </div>
    );
    return (
      <div className="full">
        <Modal {...newPage} title="Neue Seite">
          <NewPageModal {...this.props} close={newPage.close} save={this.save} />
        </Modal>
        <Modal {...general} title="Allgemeine Einstellungen">
          <GeneralModal {...this.props} close={general.close} save={this.saveMeta} meta={meta} />
        </Modal>
        <div className="pages-main sub-sidebar">
          <div className="ui segment basic no-margin" style={{ paddingBottom: 0 }}>
            <h1 style={{ flex: '0 0 auto' }} className="ui header center aligned icon disabled">
              <i className="huge file text icon"></i>
              <a className="sub header" href="javascript:;" onClick={newPage.open}>Neue Seite</a>
              <a className="sub header" href="javascript:;" onClick={general.open}>Meta-Einstellungen</a>
            </h1>
          </div>
          <div className="ui divider no-spacing-top" />
          <div className="ui segment basic no-spacing-top">
            {navigation ? Object.keys(navigation).map(this.renderNavGroup) : null}
          </div>
        </div>
        <div className="full with-sub-sidebar">
          {children}
        </div>
      </div>
    );
  }
}
