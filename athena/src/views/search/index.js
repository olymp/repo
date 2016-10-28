import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import ReactDOM from 'react-dom';
import Throttle from '../../utils/throttle-input';
const throttle = Throttle(1000);
import './main.less';

function highlight(text, term) {
  const colors = ["#ff0", "#44FF48", "#91D2FF", "#FFC2FC", "#FF9328"];
  term.split(' ').forEach((fragment, index)=> {
    text = text.replace(
      new RegExp(fragment + '(?!([^<]+)?>)', 'gi'),
      '<b style="background-color:' + colors[index % colors.length] + ';font-size:100%">$&</b>'
    );
  });
  return text;
}

class Search extends Component {
  constructor(props, context) {
    super();
    this.state = {
      active: null,
      term: ''
    };
  }

  search(term) {
    const {search} = this.context.store.search;
    this.setState({
      term: term
    });
    throttle(()=>search(term));
  }

  activate(index) {
    this.setState({
      active: index
    });
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  };

  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.input).focus();
  }

  getLink(item) {
    let link = '/';
    if (item.model === 'page') {
      link = '/ref/' + item.id;
    }
    else if (item.model === 'file') {
      link = '/c/media/' + item.id;
    }
    else if (item.model === 'user') {
      link = '/c/user/' + item.id;
    }
    else if (item.model) {
      link = '/c/data/' + item.model + '/' + item.id;
    }
    return link;
  }

  checkKey(e) {
    const {activate} = this, {active} = this.state;
    const {data} = this.context.store.search, {push} = this.context.router;

    e = e || window.event;
    if (e.keyCode == '38' || e.keyCode == '40' || e.keyCode == '13') {
      if (!data || data.length === 0) {
        activate(null);
      }
      else if (active === null) {
        activate(0);
      }
      // Key up
      else if (e.keyCode == '38') {
        activate(active !== 0 ? (active - 1) : 0);
      }
      // Key down
      else if (e.keyCode == '40') {
        activate(active !== (data.length - 1) ? (active + 1) : (data.length - 1));
      }
      // Enter
      else if (e.keyCode == '13') {
        push(this.getLink(data[active]));
      }
      e.preventDefault();
    }
  }

  render() {
    const {term, data} = this.state;

    const _data = (data || []).map(item=> {
      const link = this.getLink(item);

      const properties = item.properties.map(property=> {
        const html = highlight(property.text || '', term);
        return (
          <small className='text-muted clear text-ellipsis' key={property.name}>
            {property.name}:&nbsp;
            <span dangerouslySetInnerHTML={{__html: html}}/>
          </small>
        );
      });

      return (
        <Link key={item.id} to={link} className="item">
          {!item.image ? null :
            <img src={item.image.replace("/image/upload/", "/image/upload/w_100,h_100,c_fill,q_100,e_vibrance:33/")}
                 className="ui avatar image"/>}
          <div className="content">
            <div className="header">{item.model}: {item.name}</div>
            <div className="description">
              {properties}
            </div>
          </div>
        </Link>
      )
    });

    return (
      <div className="ui three column grid">
        <div className="column"></div>
        <div className="column">
          <div className="ui basic segment center aligned ">
            <h2 className="ui icon header">
              <div className="content">
                <div className="sub header">Schlagworte oder Text eingeben.</div>
              </div>
            </h2>
            <div className='ui fluid massive icon input'>
              <input ref='input' type='text' value={term || ''} onKeyDown={::this.checkKey}
                     onChange={e=>this.search(e.target.value)} placeholder='Suche'/>
              <i className="search icon"></i>
            </div>
            <div className="ui list" style={{textAlign: "left"}}>
              {_data}
            </div>
          </div>
        </div>
        <div className="column"></div>
      </div>
    );
  }
}

export default Search;

