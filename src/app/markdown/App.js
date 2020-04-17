import React from 'react';
import {render} from 'react-dom';
import {style} from './style.scss';

import {Provider, connect} from 'react-redux';
import {createStore} from 'redux';
import marked from 'marked'

const MaximizeIcon = () => ( <i className="fas fa-expand"></i> )
const MinimizeIcon = () => (<i className="fas fa-compress"></i>)
marked.setOptions({breaks: true})

const innerText = `# Welcome to my React Markdown Previewer!

## This is a sub-heading...
### And here's some other cool stuff:
  
Heres some code, \`<div></div>\`, between 2 backticks.

\`\`\`
// this is multi-line code:

function anotherExample(firstLine, lastLine) {
  if (firstLine == '\`\`\`' && lastLine == '\`\`\`') {
    return multiLineCode;
  }
}
\`\`\`
  
You can also make text **bold**... whoa!
Or _italic_.
Or... wait for it... **_both!_**
And feel free to go crazy ~~crossing stuff out~~.

There's also [links](https://www.freecodecamp.com), and
> Block Quotes!

And if you want to get really crazy, even tables:

Wild Header | Crazy Header | Another Header?
------------ | ------------- | ------------- 
Your content can | be here, and it | can be here....
And here. | Okay. | I think we get it.

- And of course there are lists.
  - Some are bulleted.
     - With different indentation levels.
        - That look like this.


1. And there are numbererd lists too.
1. Use just 1s if you want! 
1. But the list goes on...
- Even if you use dashes or asterisks.
* And last but not least, let's not forget embedded images:`;



// being setion on redux


const defaultState = {

  windows: {
    fullSize: false,
    editor: {width: 7, fullSize: false, innerText: innerText},
    preview: {width: 5, fullSize: false, innerText: marked(innerText)},
  }
}

const EDIT = "EDIT"
const RESIZE = "RESIZE"
const createUpdateAction = (text) => {
 // console.log("creating an action updateText")
  return {
    type: EDIT,
    text
  }
}
const createResizeAction = (id, fullSize) =>{ 
  return {
    type: RESIZE,
    id, 
    fullSize
  }
}
const messageReducer = (state=defaultState, action)=>{
 //  console.log("observed action " + action.type)
    let holder = {...state}
    switch (action.type){  
        case EDIT:
          holder.windows.editor.innerText = action.text;
          holder.windows.preview.innerText = marked(action.text)
          
          //console.log('observed edit')
          break;
        case RESIZE:
          
          holder.windows[action.id].fullSize = !holder.windows[action.id].fullSize
          holder.windows.fullSize = !holder.windows.fullSize
         // console.log("observed a resize event id:" + action.id + " action.fullSize")
          break;
        default:

    }
    return holder;
}
const store = createStore(messageReducer)
// END SETUP for Redux

/** SEtting up the WindowComponent**/
const WindowHeader = (props) => {
  return(
       <div className={style + " windowHeader" }>
          <div className={style }>{props.name} {props.testProp}</div>
          <div className={style }> 
            <a href="#" className={style} style={{color:"black"}} onClick={props.sizeCallback}>{!props.fullScreen?<MaximizeIcon />:<MinimizeIcon />}</a>
          </div>
       </div>
  )
}
const EditorTextArea = connect(
  state => ({text: state.windows.editor.innerText}),
  dispatch => ({
    update: (event) => {

      dispatch ({type: EDIT, text: event.target.value})
    }
  })
)((props) => {

 // console.log("in editor text area render")
  return (
    <div className={style + " windowDisplay"}>
      <textarea id="editor" onChange={props.update} value={props.text}  className={style }>

      </textarea>
    </div>
  )
});

const PreviewArea = connect(
  state => ({text: state.windows.preview.innerText}),
  null
)((props) => {

 // console.log("updating the prview area: ")
  let rawMarkup = {
    __html: props.text
  }
  //
  return (
    <div className={style + " windowDisplay"}>
      <div id="preview" dangerouslySetInnerHTML={rawMarkup} className={style }>
      </div>
    </div>
  )
});
class WindowComponent extends React.Component{

  constructor(props){
    super(props)
    //console.log(JSON.stringify(props))
    this.state = {
      width: 'col-md-' + props.screen.width,
      minimizeWidth: props.screen.width,
      input: "",
      fullScreen: props.screen.fullSize
    }

    this.sizeCallback = this.sizeCallback.bind(this)

  }



  sizeCallback(event){
    
  //  console.log("sizeCallback in window component.")
    if(this.state.fullScreen){

      this.props.resizeWindow(this.props.id, this.minimizeWidth)
    }else{

      this.props.resizeWindow(this.props.id, 12)
    }

  }
  
  render(){
    //console.log("in windowCompoent render")
     return(
       <div className={this.props.styleClass +" "+style} >

            <WindowHeader name={this.props.name} sizeCallback={this.sizeCallback} fullScreen={this.state.fullScreen} testProp={this.props.testProp}/>
            {this.props.display}

       </div>
     )
  }
}
WindowComponent = connect(
  function mapStateToProps(state, ownProps){
   // console.log("mapping state to props for window components  " + ownProps.id)
    let fullSize = state.windows[ownProps.id].fullSize
    //   console.log("width is  " + state.windows[ownProps.id].width)

    let styleClass = ""
    if(!state.windows.fullSize){
      styleClass = "window " 
    }else{
      if(fullSize){
        styleClass = "window "
      }else{
        styleClass = "window windowHide"
      }
    }

    
    let toReturn = {
      width: state.windows[ownProps.id].width,
      fullSize: fullSize,
      styleClass: styleClass
    }
    return toReturn
  },
  function mapDispatchToProps(dispatch){
    return{
      resizeWindow: (id, width) => {
        dispatch(createResizeAction(id, width))
      }
    }
  }, null,  {forwardRef: true}
)(WindowComponent)

class App extends React.Component{
  constructor(props){
    super(props)
    this.state ={
      fullScreen: props.fullScreen ? "fullScreen" : ""
    }
    this.editorRef = React.createRef();
    this.previewRef = React.createRef();
    console.log("Constructed Pomodoro Clock created by Mariano Hernandez 2020. Enjoy")
  }
  


  render(){

    //console.log("render for app")
    return (
        <div className={style + " outerDiv " + this.state.fullScreen}>         
          <div className={style + " innerDiv "} >
            <WindowComponent screen={this.props.editor} name="Editor" id='editor' ref={this.editorRef} display={<EditorTextArea />} />
            <WindowComponent screen={this.props.preview} name="Preview" id='preview' ref={this.previewRef} display={<PreviewArea />} />
          </div>
        </div>
    )
  }
}
App = connect(
  function mapState(state){


    var toReturn = {
      editor: state.windows.editor,
      preview: state.windows.preview
    }

    return toReturn
  },
  function mapDispatches(dispatch){
    return {
      updateText: (text) => {
        dispatch(createUpdateAction(text))
      }
    }
  }
)(App)


App.id = 'markdown';

const AppWrapper = (props)=><Provider store={store}><App {...props}/></Provider>;
      
export default AppWrapper;
 