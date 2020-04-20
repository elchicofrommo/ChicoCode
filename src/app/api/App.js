import React, {useState, useEffect, useRef} from 'react';
import {render} from 'react-dom';
import {} from './globals';
import {style} from './style';

import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import {bootstrap} from 'bootstrap/dist/css/bootstrap.min.css';
import {ApiRouteComponent} from './OpenApiRouteComponent';
import marked from 'marked';
import AnimateHeight from 'react-animate-height';
import ReactTooltip from 'react-tooltip'
import $ from 'jquery';
import FormBuilder from 'openapi-form-generator';

marked.setOptions({breaks: true})
import $RefParser from "@apidevtools/json-schema-ref-parser";


const InfoSection = (props) =>{
    return(
      <div id="routeInfo" className={[style].join(" ") }>
        <h1 >
          {props.routeMeta.info.title}
        </h1>
        <div >
          <label htmlFor="description" >
            Description
          </label>
          <div id="description"  dangerouslySetInnerHTML={{__html: marked(props.routeMeta.info.description||"")}}>
          </div>
        </div>
        <div>
          <label htmlFor="version" >
            Version
          </label>
          <div id="version" >
            {props.routeMeta.info.version}
          </div>
        </div>
        <div >
          <label htmlFor="contact" >
            Contact
          </label>
          <div id="contact">
            {props.routeMeta.info.contact.email}
          </div>
        </div>
      </div>
      )
}


const RouteGroupPicker = (props) => {

  let options = []
  //console.log("props is " + JSON.stringify(props))
  props.tags.forEach((entry)=>{
    options.push(
      <Dropdown.Item key={entry.name} as="button" className={ " apiItem"} onClick={(e)=>{props.callback(entry.name, e)}} >
        <div className={" apiName"}>{entry.name}</div>
        <div className={" apiDescription"} dangerouslySetInnerHTML={{__html: marked(entry.description||"")}}></div>
      </Dropdown.Item>
    )
  })
  return (
    <div className={ " menuSection"} id="routePicker">
      <DropdownButton id="apiMenu"  title="Select an API">
        {options}
      </DropdownButton>
    </div>

  )
}

function PathComponent(params){
  const [open, setOpen] = useState(false);

  const methods = renderMethods(params.path, params.details)

  const drawer = open ? " open " : " closed ";
  const height = open ? "auto" : "0";
  const closeableDiv = useRef(null);

  function renderMethods(path, details){
    let formHandlers = [];
    for(const method in details){
      formHandlers.push(
        <ApiRouteComponent method={method} operation={details[method].operation} key={details[method].id}/>
      )
    }

    return formHandlers;
  }
  function  toggleDrawer(){
    const el = closeableDiv.current;
    setOpen(!open)
    if(open){
      $(el).slideUp(300)
    }else{
      $(el).slideDown(300)
    }
    
  }
  ReactTooltip.rebuild();

  return(
      <div  className={ " routeDetail"} key={params.path}>
        <div className={ " closeableDivHeader"} onClick={toggleDrawer}>
          <i className={ drawer + " fas fa-caret-down"} ></i>
          <div >{params.path}</div>
          
        </div>
          <div duration={500} ref={closeableDiv} height={height} className={ drawer + " closeableDiv"}>
            {methods}
          </div>
      </div>
  )
}


class RouteInterrogators extends React.Component {
  constructor(props){
    super(props);
    console.log("constructing apinavigator " );
    this.state = {
      open: true
    }
  }

  render() {
    
    
    const routes = [];
    if(!this.props.active)
      return <div id="routeInterrogators"><div  className={style} >Select API</div></div>

    for(const path in this.props.routes[this.props.active]){

      routes.push(
        <PathComponent path={path} details={this.props.routes[this.props.active][path]}/>
      );
    }
    const externalDocs = this.props.routeMeta.tags[this.props.active].externalDocs;
    let externalDescription = undefined;
    let externalUrl = undefined
    if(externalDocs){
      if(externalDocs.description){
        externalDescription = <div  dangerouslySetInnerHTML={{__html: marked(externalDocs.description)}}></div>
      }
      
      if(externalDocs.url){
        externalUrl = <div><a href={externalDocs.url}  className={style}>
            {externalDocs.url}</a></div>
      }
    }
    return(
        <div id="routeInterrogators">
          <h2 >{this.props.active}</h2>
          <div className={ " tagMeta"}>
            <div dangerouslySetInnerHTML={{__html: marked(this.props.routeMeta.tags[this.props.active].description||"")}}></div>
            {externalDescription || ""}
            {externalUrl || ""}
            
          </div>
          {routes}
        </div>
    )
  }
}

class App extends React.Component{
  constructor(props){
    super(props)
    this.state ={
      fullScreen: props.fullScreen ? "fullScreen" : "",
      active: undefined,
      loading: true
    }
    console.log("Constructed Calculator created by Mariano Hernandez 2020. Enjoy")
    this.handlePicker = this.handlePicker.bind(this)
    this.navRef = React.createRef();
  }

  handlePicker(active){
    this.setState({active: active})
  }

  componentDidMount(){

    console.log("mounted");
    $RefParser.dereference(this.props.source).then((result)=>{
        const routes = require('./OpenApiRouteBuilder').generateRoutes(result);
        const routeMeta = require('./OpenApiRouteBuilder').generateRouteMeta(result );
        this.setState({loading: false, routes: routes, routeMeta: routeMeta})
    }).catch((err)=>{
      this.setState({loading: false, error: err})
    })
  }
  render(){ 
    if(this.state.loading){
      return (
        <div className={[style, "themeOne outerDiv"].join(" ")  }>
          Loading file ...
        </div>
      )
    }
    if(this.state.error){
      console.log(this.state.error.stack)
      return (
        <div className={[style, "themeOne outerDiv"].join(" ")  }>
          Could not process OPEN API file. Error follows
          <div className={[style, "themeOne outerDiv error"].join(" ")  }>
            <code><pre>{this.state.error.stack}</pre></code>
          </div>
        </div>
      )
    }else{

      return (
        <div className={[style, "bootstrap themeOne outerDiv"].join(" ")  }>
          <div className={"background"} ></div>
          <InfoSection routeMeta={this.state.routeMeta} />
          <RouteGroupPicker routeMeta={this.state.routeMeta} tags={this.props.source.tags} callback={this.handlePicker}/>
          <RouteInterrogators routes={this.state.routes} routeMeta={this.state.routeMeta} active={this.state.active}/>
           <ReactTooltip multiline={true} html={true} className={ " tooltip"} />


        </div>
      )
    }
  }
}

App.id = "api";

//const AppWrapper = () => <div> super cow </div>;
export default App;