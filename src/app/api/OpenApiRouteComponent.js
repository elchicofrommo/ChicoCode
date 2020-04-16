import React from 'react';
import { style } from './style';
import marked from 'marked'
marked.setOptions({breaks: true})

function MyComponent(props){
  let ref = React.createRef();
  let {data: result, loading, refetch} = useGeneratedRestfulRoute() // this props path does n
  function handleClick(event){
    refetch({myParam: ref.current.value});
    event.preventDefault();
  }

  return(
      <form onSubmit={handleClick}>
        <input name="myParam" ref={ref}></input>
        <button type="submit">submit</button>
      </form>
  )
}

export const ApiRouteComponent = (props) => {

    let parameters = props.parameters || [];
    let processed = [];
    const refs = [];


    for (const location in props.operation.parameters) {
        if (props.operation.parameters[location].length == 0)
            continue;
        let inputs = [];
        refs[location] = [];
        props.operation.parameters[location].forEach((entry) => {
            refs[location][entry.name] = React.createRef();
            inputs.push(
                <div key={entry.name}>
              <div className={style + " paramDescription"}>
                <label className={style}>Description</label>
                <div className={style} dangerouslySetInnerHTML={{__html: marked(entry.description||"")}} ></div>
              </div>
              <div className={style + " paramDescription"}>
                <label className={style}>Name</label>
                <div className={style}>{entry.name}</div>
              </div>
              <input type={entry.type=="file"?"file": "text"} name={entry.name} ref={refs[location][entry.name]}  className={style+" formField"}/>
            </div>
            )
        })
        processed.push(
            <div key={location} className={style + " paramLocation"}>
            <h3 className={style}>{location} parameters</h3>
           {inputs}
          </div>
        )
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
        <form  onSubmit={(event)=>{handleClick(event);}}>
          {processed} 
          <button type='submit'>submit</button>

          <div className={style + " formOutput"}>
            {<pre>{JSON.stringify(result)}</pre>}
          </div>
        </form>

    )
}