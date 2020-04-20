import React, {useState, useEffect, useRef} from 'react';
import { style } from './style';
import marked from 'marked'
import ReactJson from 'react-json-view'
import AnimateHeight from 'react-animate-height';
import ReactTooltip from 'react-tooltip';
import $ from 'jquery';

marked.setOptions({breaks: true})

export const ApiRouteComponent = (props) => {

  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState(null);
  const [refs, setRefs]  = useState([]);

  const closeableDiv = useRef(null);
  useEffect(()=>{
    setFields(generateFields())
  }, [])

  function generateFields(){
    let parameters = props.parameters || [];
    let processed = [];
   

    for (const location in props.operation.parameters) {
        if (props.operation.parameters[location].length == 0)
            continue;
        let inputs = [];
        refs[location] = [];

        props.operation.parameters[location].forEach((entry) => {
            refs[location][entry.name] = React.createRef();

            const description = generateFieldTooltip(entry);

            let input = undefined;
            console.log("need to create a drop down")

            if(entry.enum){
              
              const enums = [];
              entry.enum.forEach((entry)=>{
               enums.push(<option value={entry}>{entry}</option>)
              })
              input = <select name={entry.name} name={entry.name} ref={refs[location][entry.name]}  >{enums}</select>
            }else{
              input = <input type={entry.type=="file"?"file": "text"} name={entry.name} ref={refs[location][entry.name]}  />

            }

            inputs.push(
            <div key={entry.name} className={ " formField"}>
              <label  htmlFor={entry.name}>{entry.name} {description}</label>
              {input}
            </div>
            )
        })
        processed.push(
          <div key={location} className={ " paramLocation"}>
            <h3>{location}</h3>
            <div>{inputs}</div>
          </div>
        )
    }
    setRefs(refs);
    return processed;
  }
  function generateFieldTooltip (field){
    let description = "";
    if(field.description )
      description += field.description;
    if(field.type||field.format)
      description += "<div class='type'>" + (field.type||"") + " " + (field.format||"") + "</div>"
    if(field.required)
      description += "<div class='required'>Required</div>"


    if(description.length>0){
      return <i className={ " far fa-question-circle"} data-tip={description}></i>
    }
    else
      return "";
  }
  const drawer = open ? " open " : " closed ";
  const height = open ? "auto" : "0";

  function  toggleDrawer(){
    const el = closeableDiv.current;
    setOpen(!open)
    if(open){
      $(el).slideUp(300)
    }else{
      $(el).slideDown(300)
    }
    
  }

  const { result, fetchData } = props.operation.useHook()

  const handleClick = function(event) {
      event.preventDefault();

      const newParams = {}
      for (const location in refs) {
          newParams[location] = {};
          for (const name in refs[location]) {
              console.log(`name:${name} ref: ${JSON.stringify(refs[location][name].current.value)}`)
              if(refs[location][name].current.type=="file"){
                newParams[location][name] = refs[location][name].current.files[0];
              }
              else {
                newParams[location][name] = refs[location][name].current.value
              }
          }
      }

      fetchData(newParams);

    }



    return (
      <div className={ style + " method"} key={props.method} >

        <div className={ " methodBar closeableDivHeader"} onClick={toggleDrawer}>
          <i className={ drawer + " fas fa-caret-down"} ></i>
          <h3 className={style }>{props.method}</h3> 
          <div className={ " summary"}>{props.operation.summary}</div>
          {props.operation.description ? <i className={ " far fa-question-circle"} data-tip={props.operation.description}></i>:""}
          
          
        </div>
        <div duration={500} height={height} ref={closeableDiv} className={ drawer + " closeableDiv formSection"}>
          <form  onSubmit={(event)=>{handleClick(event);}} >
            {fields} 
            
            <button type='submit' style={{paddingBottom: '5px'}}>submit</button>


            <ReactJson src={result} theme="monokai" className={ " result"}/>

          </form>
        </div>

      </div>

    )
}