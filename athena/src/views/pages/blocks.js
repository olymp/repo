import React, {Component, PropTypes} from 'react';
import sortBy from 'lodash/sortBy';

export default class BlockLibrary extends Component{
   static contextTypes = {
      blocks: React.PropTypes.object
   }
   static defaultProps = {
      library: null
   }
   constructor() {
      super();
      this.state = {
         search: null
      };
   }
   componentDidMount(){
      //ReactDOM.findDOMNode(this.refs.input).focus();
   }
   render() {
      var {search} = this.state;

      var edits = this.props.edits || this.props.library || this.context.blocks || {get:()=>null};
      var blocks = [];

      sortBy(Object.keys(edits), key=>key).forEach(key => {
         const block = edits[key];
         var cats = !block.category ? [] : block.category.split(",");

         if(!search || !block.title || block.title.toLowerCase().indexOf(search.toLowerCase() ) >= 0){
            cats.forEach(cat=> {
               const b = {
                  name: key,
                  block
               };
               var i = blocks.filter(x=>x.name===cat);
               if (i.length > 0) {
                  i[0].children.push(b)
               }
               else {
                  blocks.push({
                     name: cat,
                     children: [b]
                  });
               }
            })
         }
      });
      blocks = sortBy(blocks, item=>item.name);

      return (
         <div className="block-menu">
            {/*<div className="ui text menu no-spacing-top">
             <div className="item" style={{width:'100%'}}>
             <div className="ui transparent icon input">
             <Input ref={"input"} value={search} updateValue={(search)=>this.setState({search})} placeholder={"Filter ..."}/>
             <i className="search link icon"></i>
             </div>
             </div>
             </div>*/}
            <h4 className="ui header">
               <div className="sub header">
                  Komponenten auf die Seite ziehen.
               </div>
            </h4>
            {blocks.map(x=>
               <div key={x.name}>
                  <h5 className="ui sub disabled header" style={{marginTop: '15px'}}>
                     {x.name}
                  </h5>
                  <div className="ui list">
                     {x.children.map(y=>
                        <BlockLibraryItem {...this.props} key={x.name + "-" + y.name} blockName={y.name} block={y.block}/>
                     )}
                  </div>
               </div>
            )}
         </div>
      );
   }
}

class BlockLibraryItem extends Component{
   constructor(){
      super();
      this.state = {
         images: false
      }
   }
   startDrag(e){
      e.dataTransfer.dropEffect = 'move';
      e.dataTransfer.setData("text", 'DRAFTJS_BLOCK_TYPE:'+this.props.blockName);
   }
   render() {
      const { block } = this.props;

      var icons = block.icon && Array.isArray(block.icon)
         ? block.icon.map(item=><i key={item} className={"icon big " + (item || "")} style={{marginLeft:"8px"}}></i>)
         : <i className={"icon big " + (block.icon || "")}></i>;

      return (
         <div className="item" draggable="true" onDragStart={::this.startDrag} style={{cursor: "move"}}>
            {icons}
            <div className="content">
               <div className="header">{block.title}</div>
               <div className="description">{block.category.trim().replace(",", ", ")}</div>
            </div>
         </div>
      );
   }
}
