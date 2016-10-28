import React from 'react';
import * as Edits from 'goodlook/edits';
import Flatten from '../../../utils/flatten';
import sortBy from 'lodash/sortBy';

export default React.createClass({
  render: function () {
    return null;
    let {metaOptions, meta, patch, navigation} = this.props;

    if (!meta) {
    }

    var _options = Object.keys(metaOptions).map(key=> {
      const option = metaOptions[key];
      var Input = Edits[option.type] || Edits.Input;
      var component = <Input type="text" required="" value={meta.json[key]}
                             updateValue={(v)=>patch({json: {...meta.json, [key]: v}})}/>;

      return (
        <div className="field" key={key}>
          <label>{option.name}</label>
          {component}
        </div>
      )
    });

    const items = [];
    if (navigation) {
      Flatten(JSON.parse(JSON.stringify(navigation['main']))).forEach(i=>items.push(i));
      Flatten(JSON.parse(JSON.stringify(navigation['foot'] || []))).forEach(i=>items.push(i));
    }
    var pageSelection = sortBy(items.map(function (item) {
      return {value: item.id, label: item.slug}
    }), (item)=> {
      return item.label;
    });

    return (
      <form className="ui form">
        <h1 className="ui header">
          Meta-Einstellungen.
          <div className="sub header">
            Allgemeine Einstellungen, die alle Seiten betreffen.
          </div>
        </h1>
        <div className="field">
          <label>Start-Seite</label>
          <Edits.Select2 name="form-field-name"
                         value={meta.startPage}
                         labelKey="label"
                         valueKey="value"
                         options={pageSelection}
                         updateValue={(x, v)=>patch({startPage: v})}/>
        </div>
        <div className="field">
          <label>Titel</label>
          <Edits.Input lines={2} type="text" required="" value={meta.name} updateValue={(v)=>patch({name: v})}/>
        </div>
        <div className="field">
          <label>Beschreibung</label>
          <Edits.Input lines={3} type="text" required="" value={meta.description}
                       updateValue={(v)=>patch({description: v})}/>
        </div>
        {_options}
      </form>
    );
  }
});
