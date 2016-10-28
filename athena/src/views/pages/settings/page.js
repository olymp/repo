import React, { Component } from 'react';
import { Select2, Input, Check } from 'goodlook/edits';
import sortBy from 'lodash/sortBy';
import { graphql } from 'react-apollo';
import { Modal, Button, FormGroup, Form, Label, Col } from 'goodlook';
import { withItem } from '../../item-provider';
import flatten from '../../../utils/flatten';

@withItem({ name: 'page' })
@graphql(gql`
  query pageList {
    items: pageList {
      id,
      slug,
      name
    }
  }
`, {
  props: ({ data }) => ({ navData: data }),
})
export default class PageSettings extends Component {
  static contextTypes = {
    templates: React.PropTypes.object,
    navigation: React.PropTypes.object,
  };

  updateParent = (x, v) => {
    const { patch } = this.props;

    if (x === null || x === 'null') {
      patch({ menu: null, parentId: null });
    } else if (x === 'foot') {
      patch({ menu: 'foot', parentId: null });
    } else {
      patch({ parentId: x });
    }
  }

  updateAlias = (href) => {
    const { patch } = this.props;

    patch({ href });
    return;

    if (aliasId === null || aliasId === 'null') {
      patch({ aliasId: null, href: null });
    } else if (aliasId === 'extern') {
      patch({ aliasId: null, href: 'http://' });
    } else {
      patch({ aliasId, href: null });
    }
  }

  updateName = name => {
    const { item, patch } = this.props;

    const oldValue = item.name;
    const value = { name };

    function cleanName(str) {
      if (!str) return null;
      return `/${str.toLowerCase().trim().split(' ').join('-')}`;
    }

    if (name && (!oldValue || !item.slug || item.slug === cleanName(oldValue))) {
      value.slug = cleanName(name);
    }

    patch(value);
  }

  saveTemplate = () => {
    const { item, patch } = this.props;
    const name = prompt('Name der Vorlage', '');
    this.context.store.cms.savePageAsTemplate(item, name).then(template => {
      patch({ templateName: template.template, templateId: template.id, templateData: {}, template });
    });
  }

  render() {
    const { patch, item, onClose, save, navData } = this.props;
    const { templates } = this.context;
    if (!item) return null;

    /* ÜBEGEORDNET */
    const items = navData.items || [];
    const alias = items.map(x => x);

    const pageSelection = sortBy(items.map(({ id, slug }) => ({
      value: id,
      label: slug,
    })), ({ label }) => label);
    pageSelection.splice(0, 0, { label: 'Fußleiste', value: 'foot' });
    pageSelection.splice(0, 0, { label: 'Hauptnavigation', value: 'null' });

    /* ALIAS */
    const aliasSelection = sortBy(alias.map(({ id, slug }) => ({
      value: id,
      label: slug,
    })), ({ label }) => label);
    aliasSelection.splice(0, 0, { label: 'Extern', value: 'extern' });
    aliasSelection.splice(0, 0, { label: 'Kein', value: 'null' });

    /* TEMPLATES */
    const listOfTemplates = Object.keys(templates || {})
      .map(key => ({ label: templates[key].label, value: key, template: key }));

    const buttons = [
      <Button key="1" color="secondary" onClick={onClose}>Abbruch</Button>,
      <span key="1.5">&nbsp;</span>,
      <Button key="2" color="primary" onClick={() => save().then(onClose)}>Speichern</Button>,
    ];

    return (
      <Modal onClose={onClose} buttons={buttons} title={!item.id ? 'Neue Seite erstellen' : 'Seite bearbeiten'}>
        <Form>
          <FormGroup row>
            <Label sm={3}>Name</Label>
            <Col sm={9}>
              <Input
                type="text"
                required
                value={item.name}
                onChange={this.updateName}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={3}>Übergeordnet</Label>
            <Col sm={9}>
              <Select2
                value={!item.parentId ? 'null' : item.parentId || item.menu}
                labelKey="label"
                valueKey="value"
                options={pageSelection}
                onChange={this.updateParent}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={3}>Slug</Label>
            <Col sm={9}>
              <Input
                type="text"
                required
                value={'/' + (item.slug || '').split('/')[(item.slug || '').split('/').length - 1]}
                onChange={(v) => { patch({ slug: (item.slug || '').replace('/' + (item.slug || '').split('/')[(item.slug || '').split('/').length - 1], v) }); }}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={3}>Alias</Label>
            <Col sm={9}>
              <Select2
                value={item.href}
                labelKey="label"
                valueKey="label"
                options={aliasSelection}
                onChange={this.updateAlias}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={3}>Beschreibung</Label>
            <Col sm={9}>
              <Input
                type="text"
                required
                value={item.description}
                onChange={(v) => patch({ description: v })}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={3}>Platzhalter</Label>
            <Col sm={9}>
              <Check value={item.placeholder} onChange={(v) => patch({ placeholder: v })} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={3}>Vorlage</Label>
            <Col sm={9}>
              <Select2
                labelKey="label"
                valueKey="value"
                value={item.templateId || item.templateName || 'Default'}
                options={listOfTemplates}
                onChange={templateName => patch({ templateName })}
              />
            </Col>
          </FormGroup>
          {this.props.isNew ? null : <div className="field">
            <a className="ui button" href="javascript:;" onClick={this.saveTemplate}>Vorlage speichern</a>
          </div>}
        </Form>
      </Modal>
    );
  }
}
