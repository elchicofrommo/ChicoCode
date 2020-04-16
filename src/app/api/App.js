"use strict"

import React, {useState, useEffect} from 'react';
import {render} from 'react-dom';
import {} from './globals';
import {style} from './style';
import api from './openapi.json';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import {bootstrap} from 'bootstrap/dist/css/bootstrap.min.css';
import {ApiRouteComponent} from './OpenApiRouteComponent';
import marked from 'marked';
marked.setOptions({breaks: true})


const routes = require('./OpenApiRouteBuilder').generateRoutes(api);
const routeMeta = require('./OpenApiRouteBuilder').generateRouteMeta(api);

const InfoSection = (props) =>{
    return(
      <div id="routeInfo" className={[style].join(" ") }>
        <h1 className={[style].join(" ")  }>
          {routeMeta.info.title}
        </h1>
        <div className={[style].join(" ")  }>
          <label htmlFor="description" className={[style].join(" ")  }>
            Description
          </label>
          <div id="description" className={[style].join(" ")  } dangerouslySetInnerHTML={{__html: marked(routeMeta.info.description||"")}}>
          </div>
        </div>
        <div className={[style].join(" ")  }>
          <label htmlFor="version" className={[style].join(" ")  }>
            Version
          </label>
          <div id="version" className={[style].join(" ")  }>
            {routeMeta.info.version}
          </div>
        </div>
        <div className={[style].join(" ")  }>
          <label htmlFor="contact" className={[style].join(" ")  }>
            Contact
          </label>
          <div id="contact" className={[style].join(" ")  }>
            {routeMeta.info.contact.email}
          </div>
        </div>
      </div>
      )
}


const RouteGroupPicker = (props) => {

  let options = []
  console.log("props is " + JSON.stringify(props))
  props.tags.forEach((entry)=>{
    options.push(
      <Dropdown.Item key={entry.name} as="button" className={style + " apiItem"} onClick={(e)=>{props.callback(entry.name, e)}} >
        <div className={style + " apiName"}>{entry.name}</div>
        <div className={style + " apiDescription"} dangerouslySetInnerHTML={{__html: marked(entry.description||"")}}></div>
      </Dropdown.Item>
    )
  })
  return (
    <div className={style + " menuSection"} id="routePicker">
      <DropdownButton className={style + " "} id="apiMenu"  title="Select an API">
        {options}
      </DropdownButton>
    </div>

  )
}



class RouteInterrogators extends React.Component {
  constructor(props){
    super(props);
    console.log("constructing apinavigator " );

    this.renderMethods = this.renderMethods.bind(this);
  }

  renderMethods(path, details){
    let formHandlers = [];
    for(const method in details){
      formHandlers.push(
        <div className={style + " method"} key={method} >
            <ApiRouteComponent  operation={details[method].operation}/>
        </div>
      )
    }

    return formHandlers;
  }

  render() {

    const toRender = [];
    if(!this.props.active)
      return <div className={style} id="routeInterrogators"><div  className={style} >Select API</div></div>

    for(const path in routes[this.props.active]){
      let methods = this.renderMethods(path, routes[this.props.active][path])
      toRender.push(
        <div  className={style} key={path}>
          <div className={style + " apiPath"}>
            {path}
          </div>

            {methods} 
        </div>
      );
    }

    return(
        <div className={style} id="routeInterrogators">
          <div className={style}>{this.props.active}</div>
          <div className={style} dangerouslySetInnerHTML={{__html: marked(routeMeta.tags[this.props.active].description||"")}}></div>
          <div className={style}>External References</div>
          <div className={style} dangerouslySetInnerHTML={{__html: marked(routeMeta.tags[this.props.active].externalDocs.description||"")}}></div>
          <div className={style}><a href={routeMeta.tags[this.props.active].externalDocs.url}  className={style}>
            {routeMeta.tags[this.props.active].externalDocs.url}</a></div>
          {toRender}
        </div>
    )
  }
}

class App extends React.Component{
  constructor(props){
    super(props)
    this.state ={
      fullScreen: props.fullScreen ? "fullScreen" : "",
      active: undefined
    }
    console.log("Constructed Calculator created by Mariano Hernandez 2020. Enjoy")
    this.handlePicker = this.handlePicker.bind(this)
    this.navRef = React.createRef();
  }

  handlePicker(active){
    this.setState({active: active})
  }

  render(){ 

    return (
      <div className={[style, "bootstrap themeOne outerDiv"].join(" ")  }>
        <InfoSection />
        <RouteGroupPicker tags={api.tags} callback={this.handlePicker}/>
        <RouteInterrogators active={this.state.active}/>
      </div>
    )
  }
}

App.id = "api";

//const AppWrapper = () => <div> super cow </div>;
export default App;