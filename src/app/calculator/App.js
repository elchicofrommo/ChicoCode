
import React from 'react';

import {render} from 'react-dom';
import {style} from './style.scss';



import {Provider, connect} from 'react-redux';
import {createStore} from 'redux';

const themes = ["themeOne", "themeTwo", "themeThree", "themeFour", "themeFive"];

// Section for setting up state
const defaultState = {
  theme: 2,
  register: "0",
  input: "0",
  lastAction: ""
}


const INPUT = 0;
const OPERATION = 1;
const EQUALS = 2;
const CLEAR = 3;
const MULTIPLY = 4;
const DIVIDE = 5;
const ADD = 6;
const SUBTRACT = 7;

const BUTTON_CLASSES = ["input", "evaluate", "evaluate", "clear"];

const messageReducer = (state=defaultState, action) => {

  let myState = {...state};
  switch(action.type){
    case INPUT:
      if(action.integer =='.' && myState.input.includes('.'))
        break;
      if(myState.input != "0")
        myState.input = myState.input + action.integer;
      else if(action.integer != "0")
        myState.input = action.integer;
      break;
    case CLEAR:
      if(myState.input =="0"){
        myState.lastAction = "";
        myState.register = "0";
      }
      myState.input = "0";
      break;
    case EQUALS:
      if(myState.lastAction != ""){
        let toEval = myState.register + myState.lastAction + myState.input;
        console.log("going to evaluate the following: " + toEval);
        myState.input = eval(toEval);
        myState.register = "0";
        myState.lastAction = "";
      }
      break;
    case OPERATION:
      if(myState.input == "0" && myState.register != "0"){
        if(myState.lastAction != "" && !myState.lastAction.includes("-") && action.operation == "-"){
          myState.lastAction = myState.lastAction + " " + action.operation;
        }else{
          myState.lastAction = action.operation;
        }
        console.log("still deciding what action to take:  " + myState.lastAction);
        break;
      }
      if(myState.register == "0"){
        myState.register = myState.input;
        myState.lastAction = action.operation;
        myState.input = "0";
      }else{
        let toEval = myState.register + myState.lastAction + myState.input;
        console.log("going to evaluate the following: " + toEval);
        myState.register = eval(toEval);
        myState.lastAction = action.operation;
        myState.input = "0";
      }
      break;


    default:
      break;
  }
  return myState;
}

const store = createStore(messageReducer);

// end section for setting up redux

/////// setup for Header 
const Header = (props) =>{
  return(
      <div className={[style, "header"].join(" ")}>
          <div className={[style, "title"].join(" ")}>{props.title}</div>
      </div>
  )
}

/////// end setup for header
const tempFunction = (event) => {
  console.log("keypressed " + event.target.id);
}
const keys = [

  {symbol: 'AC', id: 'clear', eventKey: 'Backspace',  type: CLEAR, width: 2}, 
  {type: "HOLDER"},
  {symbol: '=', id: 'equals', eventKey: '=', type: EQUALS, width: 2},
  {type: "HOLDER"},
  {symbol: '7', id: 'seven', eventKey: '7', type: INPUT},
  {symbol: '8', id: 'eight', eventKey: '8', type: INPUT},
  {symbol: '9', id: 'nine', eventKey: '9', type: INPUT},
  {symbol: 'X', id: 'multiply', eventKey: '*', type: OPERATION, subtype: MULTIPLY},
  {symbol: '4', id: 'four', eventKey: '4', type: INPUT},
  {symbol: '5', id: 'five', eventKey: '5', type: INPUT},
  {symbol: '6', id: 'six', eventKey: '6', type: INPUT},
  {symbol: '/', id: 'divide', eventKey: '/', type: OPERATION, subtype: DIVIDE},
  {symbol: '1', id: 'one', eventKey: '1', type: INPUT},
  {symbol: '2', id: 'two', eventKey: '2', type: INPUT},
  {symbol: '3', id: 'three', eventKey: '3', type: INPUT},
  {symbol: '-', id: 'subtract', eventKey: '-', type: OPERATION, subtype: SUBTRACT},
  {symbol: '0', id: 'zero', eventKey: '0', type: INPUT, width: 2},
  {type: 'HOLDER'},
  {symbol: '.', id: 'decimal', eventKey: '.', type: INPUT},
  {symbol: '+', id: 'add', eventKey: '+', type: OPERATION, subtype: ADD}

];


////// keypad class
class KeyPad extends React.Component {
  constructor(props){
    super(props);
    this.state ={

    }
    this.handleButton = this.handleButton.bind(this);
  }

  handleButton(event){

    let key = {
      id: event.target.id,
      eventkey: event.target.getAttribute('eventkey'),
      type: event.target.getAttribute('type'),
      subtype: event.target.getAttribute('subtype'),
      symbol: event.target.innerText
    }

    if(key.type == INPUT){
      this.props.input(key.symbol);
    }
    else if(key.type == OPERATION ){
      this.props.operation(key.eventkey);
    }else if(key.type == EQUALS){
      this.props.equals();
    }else {
      this.props.clear();
    }
    console.log('saw button click, heres the values ' + JSON.stringify(key));
  }

  render(){

    let rows = [];
    let buttons = [];
    for(let i=0; i<5;i++){

      buttons = [];

      for(let j=0;j <4 && i*4 + j < keys.length;j++){
        let key = keys[(i*4)+j];

        let width = key.width ? "doubleButton" : "";

        if(key.type ==  "HOLDER")
          continue;

        buttons.push(
          <button className={[style, width, BUTTON_CLASSES[key.type], "button"].join(" ")  }  
            id={key.id} 
            eventkey={key.eventKey} 
            onClick={this.handleButton}
            type={key.type}
            subtype={key.subtype}>
            {key.symbol}
          </button>
          );
      }

      rows.push(
        <div className={[style, "keyRow"].join(" ")}>{buttons}</div>
      );

    }
    return(

      <div className={[style, "keyPad"].join(" ")}>
        {rows}
      </div>

    )
  }
}

KeyPad = connect(
  (state, ownState) => {return state},
  (dispatch, ownState)=>{
    return{
      input: (integer)=> {
        dispatch({type: INPUT, integer: integer});
      },
      operation: (operation)=>{
        dispatch({type: OPERATION, operation: operation});
      },
      equals: () => {
        dispatch({type: EQUALS});
      },
      clear: () => {
        dispatch({type: CLEAR});
      }
    }
  }
)(KeyPad)
////// end keypad class

// App component section

class App extends React.Component{
  constructor(props){
    super(props)
    this.state ={
      fullScreen: props.fullScreen ? "fullScreen" : ""
    }
    this.inputHandler = this.inputHandler.bind(this)

  }
  
  inputHandler(event){
    console.log("observed change in parent input handler. " )

  }

  componentDidMount(prevProp, prevState){
    console.log("componentDidMount")

  }
  render(){


    return (
        <div className={[style, themes[this.props.theme], this.state.fullScreen, "outerDiv"].join(" ")}  >         
          <div className={[style, "innerDiv"].join(" ")} >

            <Header title="Calculator" />

            <div className={[style, ""].join(" ")}>

                <div className={[style, "textField"].join(" ")}>{this.props.register}</div>

            </div>
            <div className={[style, ""].join(" ")}>

                <div className={[style, "textField"].join(" ")} id="display">{this.props.input}</div>

            </div>

            <KeyPad />
          </div>
    
        </div>
    )
  }
}

App = connect(
  function mapStateToProps(state, ownProps){
    return state;
  }, 
  function mapDispatchToProps(dispatch){
    return {
      testFunction: (testInput) => {

      }
    }
  }
)(App);


App.id = "calculator";

const AppWrapper = (props)=> <Provider store={store} className={style}><App {...props} /></Provider>;

//const AppWrapper = () => <div> super cow </div>;
export default AppWrapper;



