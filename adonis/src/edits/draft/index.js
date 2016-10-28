import React, { Component } from 'react';
import Editor from 'draft-wysiwyg';
import { toMd, toDraft } from 'draft-wysiwyg/lib/md';
import Textarea from 'react-textarea-autosize';
import './index.less';

class DraftEditor extends Component {
  static contextTypes = {
    blocks: React.PropTypes.object,
    markdownEdit: React.PropTypes.bool,
  };
  state = {};
  batch = batch(200);

  updateValue = (v) => {
    const { updateValue, onChange } = this.props;
    (updateValue || onChange)(v);
  }

  updateValueTA = (v) => {
    const md = v.target.value;
    this.setState({ md });
    this.batch(() => {
      this.updateValue(toDraft(md));
    });
  }

  switch = () => {
    let { md } = this.state;
    let { value } = this.props;
    if (md) {
      this.setState({ md: null });
    } else {
      this.setState({ md: toMd(value) });
    }
  }

  render() {
    let { md } = this.state;
    let { value, readOnly } = this.props;
    let { markdownEdit } = this.context;
    if (typeof value === 'string') value = null;
    if (markdownEdit) {
      return (
        <Textarea
          style={{ width: '100%' }}
          className="form-control md-textarea"
          value={md || toMd(value)}
          readOnly={readOnly}
          onChange={this.updateValueTA}
        />
      );
    }
    return (
      <Editor
        value={value}
        readOnly={readOnly}
        blockTypes={this.context.blocks}
        onChange={this.updateValue}
        cleanupTypes="*"
      />
    );
  }
}

export default DraftEditor;

const batch = (limit = 500) => {
  let _callback = null;
  return (callback) => {
    _callback = callback;
    setTimeout(() => {
      if (_callback === callback) {
        callback();
      }
    }, limit);
  };
};
