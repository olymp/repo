import React, { Component, PropTypes } from 'react';
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/json';
import 'brace/theme/github';

let count = 0;
export default class Ace extends Component {
  id = count++;
  render() {
    return (
      <AceEditor
        {...this.props}
        value={this.props.value}
        mode="json"
        theme="github"
        onChange={this.props.onChange}
        name={`ace${this.id}`}
        editorProps={{ $blockScrolling: false }}
        tabSize={2}
        useSoftTabs
        showGutter
        displayIndentGuides
      />
    );
  }
}
