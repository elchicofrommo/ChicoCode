"use strict"

import React, {useState, useEffect} from 'react';
import {render} from 'react-dom';
import {} from './globals';
import {style} from './style';
import api from './api_def.json';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import {bootstrap} from 'bootstrap/dist/css/bootstrap.min.css';
import * as ApiRoutes from './api_def.tsx'

const InfoSection = (props) =>{
    return(
      <div id="infoSection" className={[style].join(" ") }>
        <h1 className={[style].join(" ")  }>
          {props.title}
        </h1>
        <div className={[style].join(" ")  }>
          <label htmlFor="description" className={[style].join(" ")  }>
            Description
          </label>
          <div id="description" className={[style].join(" ")  }>
            {props.description}
          </div>
        </div>
        <div className={[style].join(" ")  }>
          <label htmlFor="version" className={[style].join(" ")  }>
            Version
          </label>
          <div id="version" className={[style].join(" ")  }>
            {props.version}
          </div>
        </div>
        <div className={[style].join(" ")  }>
          <label htmlFor="contact" className={[style].join(" ")  }>
            Contact
          </label>
          <div id="contact" className={[style].join(" ")  }>
            {props.contact.email}
          </div>
        </div>
      </div>
      )
}


const TagSection = (props) => {

  let options = []
  console.log("props is " + JSON.stringify(props))
  props.tags.forEach((entry)=>{
    options.push(
      <Dropdown.Item key={entry.name} as="button" className={style + " apiItem"} onClick={(e)=>{props.callback(entry.name, e)}} >
        <div className={style + " apiName"}>{entry.name}</div>
        <div className={style + " apiDescription"}>{entry.description}</div>
      </Dropdown.Item>
    )
  })
  return (
    <div className={style + " menuSection"}>
      <DropdownButton className={style + " "} id="apiMenu"  title="Select an API">
        {options}
      </DropdownButton>
    </div>

  )
}

function useRemoteApi(operation){

  function encodeParams(params){
    const encodedParams = {};
    for(const name in params){
      encodedParams[name] = encodeURIComponent(params[name]);
    }
     
    return encodedParams;
  }


  function fetchData(params){
    let clone = {...state};

    let path = clone.operation.path;
    let error = [];

    // create the path
    clone.operation.parameters.path.forEach((entry)=>{
      let exp = new RegExp(`{${entry.name}}`, 'i')
      if(!path.match(exp)){
        error.push(`missing parameter ${entry.name}`);
        return;
      }
      path = path.replace(exp, encodeURIComponent(params.path[entry.name]));
    })

    if(error.length>0){
      clone.result = "The following errors occured: " +JSON.stringify(error);
      setState(clone);
      return;
    }

    let queryParams = []

    // add the query params
    clone.operation.parameters.query.forEach((entry)=>{
      queryParams.push(`${entry.name}=${encodeURIComponent(params.query[entry.name])}`)
    })

    if(queryParams.length>0){
      path = path + "?" + queryParams.join("&")
    }

    let bodyParams = {}
    clone.operation.parameters.body.forEach((entry)=>{
      bodyParams[entry.name]=params.body[entry.name]
    })

    console.log(`constructed full path ${path} with body ${JSON.stringify(bodyParams, "", 2)}`)

    let req = {
      method: clone.operation.verb.toUpperCase(),
      cache: 'no-cache',
      headers: {
        'Content-Type': clone.operation.consumes || 'application/json'
      }
    } 

    if(!clone.operation.verb.match(/get/i)||clone.operation.parameters.body.length > 0){

      req.body= JSON.stringify(bodyParams)
    }
    // now lets set up the fetch
    fetch(path,
      req
    ).then((response)=>{
      console.log("successful fetch " + JSON.stringify(response))
      return response.json()
    }).then((data)=>{
      clone.result = JSON.stringify(data);
      setState(clone);
    }).catch((err)=>{
      console.log("failed fetch " + JSON.stringify(err))
      clone.result = JSON.stringify(err)
      setState(clone);
    })
  }

  const [state, setState] = useState({
    ready: false,
    result: "initial result ...",
    loading: false, 
    operation: operation
  });

  return {result: state.result, loading: state.loading, fetchData}
}

function useTimerTest(){

  function startTimer(){
    const newState = {...myState}
    setTimeout(()=>{
      
      newState.result = myState.result + 1;
      setMyState(newState)

    }, 1000)
  }

  function stopTimer(){
    var newState = {...myState}
    newState.keepGoing = false;
    setMyState(newState)
  }
   const [myState, setMyState] = useState({
     keepGoing: true,
     result: 0
   })

   return {result: myState.result, startTimer, stopTimer}
}

const FormHandler = (props)=>{

      let parameters = props.parameters || [];
      let bodyParams = props.operation
      let pathParams = []
      let queryParams = []
      let processed = [];
      let inputs = [];
      const refs = [];
      const params = [];

      for(const location in props.operation.parameters){
        if(props.operation.parameters[location].length==0)
          continue;
        inputs = [];
        refs[location] = [];
        props.operation.parameters[location].forEach((entry)=>{
          refs[location][entry.name] = React.createRef();
          inputs.push(
            <div key={entry.name}>
              <div className={style + " paramDescription"}>
                <label className={style}>Description</label>
                <div className={style}>{entry.description}</div>
              </div>
              <div className={style + " paramDescription"}>
                <label className={style}>Name</label>
                <div className={style}>{entry.name}</div>
              </div>
              <input type="text" name={entry.name} ref={refs[location][entry.name]}  className={style+" formField"}/>
            </div>
          )
        })
        processed.push(
          <div key={location} class={style + " paramLocation"}>
            <h3 class={style}>{location} parameters</h3>
           {inputs}
          </div>
        )
      }

      const {result, fetchData} = useRemoteApi(props.operation)

     //const{result, startTimer, stopTimer} = useTimerTest();

      const handleClick = function(event){
        event.preventDefault();

        const newParams = {}
        for(const location in refs){
          newParams[location] = {};
          for(const name in refs[location]){
            console.log(`name:${name} ref: ${JSON.stringify(refs[location][name].current.value)}` )
            newParams[location][name] = refs[location][name].current.value
          }
        }

        
        fetchData(newParams);
        


        //  startTimer();

      }

    return (
        <form action={props.path} method={props.method} onSubmit={(event)=>{
          handleClick(event);
        }}>
          {processed} 
          <button type='submit'>submit</button>

          <div className={style + " formOutput"}>
            {<pre>{JSON.stringify(result)}</pre>}
          </div>
        </form>
        
    )
}


class ApiNavigator extends React.Component {
  constructor(props){
    super(props);
    console.log("constructing apinavigator " )
    this.paths = this.massagePaths(props.paths)

    this.massagePaths = this.massagePaths.bind(this);
    this.renderPaths = this.renderPaths.bind(this);
    this.renderMethods = this.renderMethods.bind(this);
    this.processBodyParams = this.processBodyParams.bind(this);
  }

  massagePaths(paths){
    let massaged = {};
    //console.log(`api routes is ` + ApiRoutes)
    for(const path in paths){
      for(const verb in paths[path]){
        const {tags, summary, parameters, produces} = paths[path][verb]
        console.log(`${path} ${verb} ${tags} ${summary} ${parameters} ${produces}`)
        if(!massaged[tags])
          massaged[tags] = {}
        if(!massaged[tags][path])
          massaged[tags][path] = {} 

        // pull out the api route function 
        let opString = paths[path][verb].operationId;
        opString = opString.charAt(0).toUpperCase() + opString.slice(1)
        const operation = { 
          path: path,
          verb: verb ,
          parameters: {
            path: [],
            body: [],
            query: []
          }
        }

        if(paths[path][verb].consumes){
          operation.consumes = paths[path][verb].consumes
        }

        if(parameters){
          parameters.forEach((entry)=>{
            if(entry.in=="path"){

              operation.parameters.path.push({name: entry.name, description: entry.description, type: entry.type})
            }else if(entry.in=="query"){
              operation.parameters.query.push({name: entry.name, description: entry.description, type: entry.type})
            }else if(entry.in=="body"){
              let processedBody = this.processBodyParams(entry.content);
              console.log(`processed body is ${JSON.stringify(processedBody, "", 2)}`)
              operation.parameters.body = operation.parameters.body.concat(processedBody)
            }else if(entry.in=="formData"){
              console.log(`proccing form data`);
               operation.parameters.body.push({name: entry.name, description: entry.description, type: entry.type})
            }
          })
        }


        console.log(`operation is ${JSON.stringify(operation, "", 2)}`)
        massaged[tags][path][verb] = {
          summary, parameters, produces, operation
        }
      }
    }

    console.log("massage path is called" )
    return massaged
  }

  processBodyParams(content){
    console.log("processing body params")
    let toReturn = []
    let formType = content['application/x-www-form-urlencoded'] 
    if(!formType){
      console.log(`unnown form type, need to expand capabilities mario `)
      return toReturn;
    }
    let type = formType.schema.type;
    if(type != "object"){
      console.log("unknown schema type " + type + " need to expand capabilities mario");
      return toReturn;
    }
    formType.schema.properties.forEach((property)=>{

      for(const entry in property){
        toReturn.push(
          {
            name: entry,
            type: property[entry].type
          }
        )
      }
    })

    return toReturn 
  }

  renderMethods(path, details){
    let formHandlers = [];
    for(const method in details){
      formHandlers.push(
        <div className={style + " method"} key={method} >
          <div>{method}</div>
          <div>{details[method].summary}</div>
            <FormHandler path={path} method={method} parameters={details[method].parameters} operation={details[method].operation}/>
        </div>
      )
    }

    return formHandlers;
  }


  renderPaths(tag){

    if(tag =="none")
      return "Select API Group above";

    const toRender = [];

    for(const path in this.paths[tag]){
      let methods = this.renderMethods(path, this.paths[tag][path])
      toRender.push(
        <div key={path}>
          <div className={style + " apiPath"}>
            {path}
          </div>

            {methods} 
        </div>
      );
    }

    return toRender;
  }

  render() {
    return (

      <div>
        {this.renderPaths(this.props.active)}
      </div>
    )
  }
}

class App extends React.Component{
  constructor(props){
    super(props)
    this.state ={
      fullScreen: props.fullScreen ? "fullScreen" : "",
      active: "none"
    }
    console.log("Constructed Calculator created by Mariano Hernandez 2020. Enjoy")
    this.navigatorCallback = this.navigatorCallback.bind(this)
    this.navRef = React.createRef();
  }

  navigatorCallback(active){
    this.setState({active: active})
  }

  render(){ 
    let url ="http://petstore.swagger.io/v2/swagger.json";
    let spec = 
      {"swagger":"2.0","info":{"description":"This is a sample server Petstore server.  You can find out more about Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).  For this sample, you can use the api key `special-key` to test the authorization filters.","version":"1.0.5","title":"Swagger Petstore","termsOfService":"http://swagger.io/terms/","contact":{"email":"apiteam@swagger.io"},"license":{"name":"Apache 2.0","url":"http://www.apache.org/licenses/LICENSE-2.0.html"}},"host":"petstore.swagger.io","basePath":"/v2","tags":[{"name":"pet","description":"Everything about your Pets","externalDocs":{"description":"Find out more","url":"http://swagger.io"}},{"name":"store","description":"Access to Petstore orders"},{"name":"user","description":"Operations about user","externalDocs":{"description":"Find out more about our store","url":"http://swagger.io"}}],"schemes":["https","http"],"paths":{"/pet/{petId}/uploadImage":{"post":{"tags":["pet"],"summary":"uploads an image","description":"","operationId":"uploadFile","consumes":["multipart/form-data"],"produces":["application/json"],"parameters":[{"name":"petId","in":"path","description":"ID of pet to update","required":true,"type":"integer","format":"int64"},{"name":"additionalMetadata","in":"formData","description":"Additional data to pass to server","required":false,"type":"string"},{"name":"file","in":"formData","description":"file to upload","required":false,"type":"file"}],"responses":{"200":{"description":"successful operation","schema":{"$ref":"#/definitions/ApiResponse"}}},"security":[{"petstore_auth":["write:pets","read:pets"]}]}},"/pet":{"post":{"tags":["pet"],"summary":"Add a new pet to the store","description":"","operationId":"addPet","consumes":["application/json","application/xml"],"produces":["application/json","application/xml"],"parameters":[{"in":"body","name":"body","description":"Pet object that needs to be added to the store","required":true,"schema":{"$ref":"#/definitions/Pet"}}],"responses":{"405":{"description":"Invalid input"}},"security":[{"petstore_auth":["write:pets","read:pets"]}]},"put":{"tags":["pet"],"summary":"Update an existing pet","description":"","operationId":"updatePet","consumes":["application/json","application/xml"],"produces":["application/json","application/xml"],"parameters":[{"in":"body","name":"body","description":"Pet object that needs to be added to the store","required":true,"schema":{"$ref":"#/definitions/Pet"}}],"responses":{"400":{"description":"Invalid ID supplied"},"404":{"description":"Pet not found"},"405":{"description":"Validation exception"}},"security":[{"petstore_auth":["write:pets","read:pets"]}]}},"/pet/findByStatus":{"get":{"tags":["pet"],"summary":"Finds Pets by status","description":"Multiple status values can be provided with comma separated strings","operationId":"findPetsByStatus","produces":["application/json","application/xml"],"parameters":[{"name":"status","in":"query","description":"Status values that need to be considered for filter","required":true,"type":"array","items":{"type":"string","enum":["available","pending","sold"],"default":"available"},"collectionFormat":"multi"}],"responses":{"200":{"description":"successful operation","schema":{"type":"array","items":{"$ref":"#/definitions/Pet"}}},"400":{"description":"Invalid status value"}},"security":[{"petstore_auth":["write:pets","read:pets"]}]}},"/pet/findByTags":{"get":{"tags":["pet"],"summary":"Finds Pets by tags","description":"Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.","operationId":"findPetsByTags","produces":["application/json","application/xml"],"parameters":[{"name":"tags","in":"query","description":"Tags to filter by","required":true,"type":"array","items":{"type":"string"},"collectionFormat":"multi"}],"responses":{"200":{"description":"successful operation","schema":{"type":"array","items":{"$ref":"#/definitions/Pet"}}},"400":{"description":"Invalid tag value"}},"security":[{"petstore_auth":["write:pets","read:pets"]}],"deprecated":true}},"/pet/{petId}":{"get":{"tags":["pet"],"summary":"Find pet by ID","description":"Returns a single pet","operationId":"getPetById","produces":["application/json","application/xml"],"parameters":[{"name":"petId","in":"path","description":"ID of pet to return","required":true,"type":"integer","format":"int64"}],"responses":{"200":{"description":"successful operation","schema":{"$ref":"#/definitions/Pet"}},"400":{"description":"Invalid ID supplied"},"404":{"description":"Pet not found"}},"security":[{"api_key":[]}]},"post":{"tags":["pet"],"summary":"Updates a pet in the store with form data","description":"","operationId":"updatePetWithForm","consumes":["application/x-www-form-urlencoded"],"produces":["application/json","application/xml"],"parameters":[{"name":"petId","in":"path","description":"ID of pet that needs to be updated","required":true,"type":"integer","format":"int64"},{"name":"name","in":"formData","description":"Updated name of the pet","required":false,"type":"string"},{"name":"status","in":"formData","description":"Updated status of the pet","required":false,"type":"string"}],"responses":{"405":{"description":"Invalid input"}},"security":[{"petstore_auth":["write:pets","read:pets"]}]},"delete":{"tags":["pet"],"summary":"Deletes a pet","description":"","operationId":"deletePet","produces":["application/json","application/xml"],"parameters":[{"name":"api_key","in":"header","required":false,"type":"string"},{"name":"petId","in":"path","description":"Pet id to delete","required":true,"type":"integer","format":"int64"}],"responses":{"400":{"description":"Invalid ID supplied"},"404":{"description":"Pet not found"}},"security":[{"petstore_auth":["write:pets","read:pets"]}]}},"/store/order":{"post":{"tags":["store"],"summary":"Place an order for a pet","description":"","operationId":"placeOrder","consumes":["application/json"],"produces":["application/json","application/xml"],"parameters":[{"in":"body","name":"body","description":"order placed for purchasing the pet","required":true,"schema":{"$ref":"#/definitions/Order"}}],"responses":{"200":{"description":"successful operation","schema":{"$ref":"#/definitions/Order"}},"400":{"description":"Invalid Order"}}}},"/store/order/{orderId}":{"get":{"tags":["store"],"summary":"Find purchase order by ID","description":"For valid response try integer IDs with value >= 1 and <= 10. Other values will generated exceptions","operationId":"getOrderById","produces":["application/json","application/xml"],"parameters":[{"name":"orderId","in":"path","description":"ID of pet that needs to be fetched","required":true,"type":"integer","maximum":10,"minimum":1,"format":"int64"}],"responses":{"200":{"description":"successful operation","schema":{"$ref":"#/definitions/Order"}},"400":{"description":"Invalid ID supplied"},"404":{"description":"Order not found"}}},"delete":{"tags":["store"],"summary":"Delete purchase order by ID","description":"For valid response try integer IDs with positive integer value. Negative or non-integer values will generate API errors","operationId":"deleteOrder","produces":["application/json","application/xml"],"parameters":[{"name":"orderId","in":"path","description":"ID of the order that needs to be deleted","required":true,"type":"integer","minimum":1,"format":"int64"}],"responses":{"400":{"description":"Invalid ID supplied"},"404":{"description":"Order not found"}}}},"/store/inventory":{"get":{"tags":["store"],"summary":"Returns pet inventories by status","description":"Returns a map of status codes to quantities","operationId":"getInventory","produces":["application/json"],"parameters":[],"responses":{"200":{"description":"successful operation","schema":{"type":"object","additionalProperties":{"type":"integer","format":"int32"}}}},"security":[{"api_key":[]}]}},"/user/createWithArray":{"post":{"tags":["user"],"summary":"Creates list of users with given input array","description":"","operationId":"createUsersWithArrayInput","consumes":["application/json"],"produces":["application/json","application/xml"],"parameters":[{"in":"body","name":"body","description":"List of user object","required":true,"schema":{"type":"array","items":{"$ref":"#/definitions/User"}}}],"responses":{"default":{"description":"successful operation"}}}},"/user/createWithList":{"post":{"tags":["user"],"summary":"Creates list of users with given input array","description":"","operationId":"createUsersWithListInput","consumes":["application/json"],"produces":["application/json","application/xml"],"parameters":[{"in":"body","name":"body","description":"List of user object","required":true,"schema":{"type":"array","items":{"$ref":"#/definitions/User"}}}],"responses":{"default":{"description":"successful operation"}}}},"/user/{username}":{"get":{"tags":["user"],"summary":"Get user by user name","description":"","operationId":"getUserByName","produces":["application/json","application/xml"],"parameters":[{"name":"username","in":"path","description":"The name that needs to be fetched. Use user1 for testing. ","required":true,"type":"string"}],"responses":{"200":{"description":"successful operation","schema":{"$ref":"#/definitions/User"}},"400":{"description":"Invalid username supplied"},"404":{"description":"User not found"}}},"put":{"tags":["user"],"summary":"Updated user","description":"This can only be done by the logged in user.","operationId":"updateUser","consumes":["application/json"],"produces":["application/json","application/xml"],"parameters":[{"name":"username","in":"path","description":"name that need to be updated","required":true,"type":"string"},{"in":"body","name":"body","description":"Updated user object","required":true,"schema":{"$ref":"#/definitions/User"}}],"responses":{"400":{"description":"Invalid user supplied"},"404":{"description":"User not found"}}},"delete":{"tags":["user"],"summary":"Delete user","description":"This can only be done by the logged in user.","operationId":"deleteUser","produces":["application/json","application/xml"],"parameters":[{"name":"username","in":"path","description":"The name that needs to be deleted","required":true,"type":"string"}],"responses":{"400":{"description":"Invalid username supplied"},"404":{"description":"User not found"}}}},"/user/login":{"get":{"tags":["user"],"summary":"Logs user into the system","description":"","operationId":"loginUser","produces":["application/json","application/xml"],"parameters":[{"name":"username","in":"query","description":"The user name for login","required":true,"type":"string"},{"name":"password","in":"query","description":"The password for login in clear text","required":true,"type":"string"}],"responses":{"200":{"description":"successful operation","headers":{"X-Expires-After":{"type":"string","format":"date-time","description":"date in UTC when token expires"},"X-Rate-Limit":{"type":"integer","format":"int32","description":"calls per hour allowed by the user"}},"schema":{"type":"string"}},"400":{"description":"Invalid username/password supplied"}}}},"/user/logout":{"get":{"tags":["user"],"summary":"Logs out current logged in user session","description":"","operationId":"logoutUser","produces":["application/json","application/xml"],"parameters":[],"responses":{"default":{"description":"successful operation"}}}},"/user":{"post":{"tags":["user"],"summary":"Create user","description":"This can only be done by the logged in user.","operationId":"createUser","consumes":["application/json"],"produces":["application/json","application/xml"],"parameters":[{"in":"body","name":"body","description":"Created user object","required":true,"schema":{"$ref":"#/definitions/User"}}],"responses":{"default":{"description":"successful operation"}}}}},"securityDefinitions":{"api_key":{"type":"apiKey","name":"api_key","in":"header"},"petstore_auth":{"type":"oauth2","authorizationUrl":"https://petstore.swagger.io/oauth/authorize","flow":"implicit","scopes":{"read:pets":"read your pets","write:pets":"modify pets in your account"}}},"definitions":{"ApiResponse":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"type":{"type":"string"},"message":{"type":"string"}}},"Category":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"name":{"type":"string"}},"xml":{"name":"Category"}},"Pet":{"type":"object","required":["name","photoUrls"],"properties":{"id":{"type":"integer","format":"int64"},"category":{"$ref":"#/definitions/Category"},"name":{"type":"string","example":"doggie"},"photoUrls":{"type":"array","xml":{"wrapped":true},"items":{"type":"string","xml":{"name":"photoUrl"}}},"tags":{"type":"array","xml":{"wrapped":true},"items":{"xml":{"name":"tag"},"$ref":"#/definitions/Tag"}},"status":{"type":"string","description":"pet status in the store","enum":["available","pending","sold"]}},"xml":{"name":"Pet"}},"Tag":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"name":{"type":"string"}},"xml":{"name":"Tag"}},"Order":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"petId":{"type":"integer","format":"int64"},"quantity":{"type":"integer","format":"int32"},"shipDate":{"type":"string","format":"date-time"},"status":{"type":"string","description":"Order Status","enum":["placed","approved","delivered"]},"complete":{"type":"boolean"}},"xml":{"name":"Order"}},"User":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"username":{"type":"string"},"firstName":{"type":"string"},"lastName":{"type":"string"},"email":{"type":"string"},"password":{"type":"string"},"phone":{"type":"string"},"userStatus":{"type":"integer","format":"int32","description":"User Status"}},"xml":{"name":"User"}}},"externalDocs":{"description":"Find out more about Swagger","url":"http://swagger.io"}}

    console.log("about to render the RedocStandalone with this spec " + spec)
    console.log(process)
    console.log(Buffer);

    return (
      <div className={[style, "bootstrap themeOne outerDiv"].join(" ")  }>
        <InfoSection {... api.info}/>
        <TagSection tags={api.tags} callback={this.navigatorCallback}/>
        <ApiNavigator paths={api.paths} active={this.state.active} host="/"/>
      </div>
    )
  }
}

App.id = "api";

//const AppWrapper = () => <div> super cow </div>;
export default App;