import React from 'react';
import {render} from 'react-dom';

import styles from './style';

import {Provider, connect} from 'react-redux';
import {createStore} from 'redux';


const INC_BREAK = 1;
const INC_SESSION = 2;
const DEC_BREAK = 3;
const DEC_SESSION = 4;
const RESET = 5;
const DEC_TIMER = 7;
const SWITCH_CLOCKS = 8;
const TIMER = 9;

const SESSION = 100;
const BREAK = 200;

const interval = 100;

// Section for setting up state
const defaultState = {
  message: "Hello world with my redux",
  sessionLength: 25, 
  breakLength: 5,
  time: 1500,
  clockState: SESSION,
  timing: false
}



const messageReducer = (state=defaultState, action) => {
  let holder = {...state};
//  console.log("in message reducer, state is " + JSON.stringify(state) + " action is " + JSON.stringify(action))
  switch(action.type){
    case INC_SESSION:
      if(holder.sessionLength < 60)
        holder.sessionLength ++;
      if(holder.clockState == SESSION)
        holder.time = holder.sessionLength *60
      break;
    case INC_BREAK:
      if(holder.breakLength <60)
        holder.breakLength ++;
      if(holder.clockState == BREAK)
        holder.time = holder.breakLength *60
      break;
    case DEC_SESSION:
      if(holder.sessionLength > 1)
        holder.sessionLength --;
      if(holder.clockState == SESSION)
        holder.time = holder.sessionLength *60
      break;
    case DEC_BREAK:
      if(holder.breakLength > 1)
        holder.breakLength--;
      if(holder.clockState == BREAK)
        holder.time = holder.breakLength *60
      break;
    case RESET: 
      holder.sessionLength = 25;
      holder.breakLength = 5;
      holder.time = holder.sessionLength * 60
      holder.clockState = SESSION;
      holder.timing = false;
      break;
    case DEC_TIMER:
      if(holder.time > 0)
        holder.time--;
   //   console.log("decrementing timer with interval " + action.interval + " time is " + holder.time);
      break;
    case SWITCH_CLOCKS:
      holder.clockState = holder.clockState == SESSION ? BREAK: SESSION;
      let time = holder.clockState == SESSION? holder.sessionLength: holder.breakLength
      holder.time = time * 60;
      break;
    case TIMER: 
      holder.timing = ! holder.timing;
      break;
    default:
      break;
  }
  return holder;
}

const store = createStore(messageReducer);

// end section for setting up redux

/// HEADER stateless component
/////// setup for Header 
const Header = (props) =>{
  return(
      <div className="header">
          <div className="title">{props.title}</div>
      </div>
  )
}
/// end HEADER


  const TimingButton = (props)=>{
    let className = "fa-"+props.label+"-circle"
    return(<button className="button lengthButton " 
      id={props.name} 
      disabled={props.timing} 
      onClick={props.action}>
        <i className={"fas " + className}></i>
      </button>)}; 


    const SessionDecrementButton = connect(
      state =>({timing: state.timing, label: "minus"}),
      dispatch => ({action: () =>  { dispatch({type:DEC_SESSION})}})
    )(TimingButton)

    const SessionIncrementButton = connect(
      state =>({timing: state.timing, label: "plus"}),
      dispatch => ({action: () =>  { dispatch({type:INC_SESSION})}})
    )(TimingButton)

    const BreakDecrementButton = connect(
      state =>({timing: state.timing, label: "minus"}),
      dispatch => ({action: () =>  { dispatch({type:DEC_BREAK})}})
    )(TimingButton)

    const BreakIncrementButton = connect(
      state =>({timing: state.timing, label: "plus"}),
      dispatch => ({action: () =>  { dispatch({type:INC_BREAK})}})
    )(TimingButton)

    const LengthContainer = (props) => {

   //   console.log("in render for " + props.name);
      return(
        <div className="lengthContainer col-sm-5">

          <div className="row justify-content-center">

            <div className="col-auto decrementButton align-self-center" >
              {props.decrement}
            </div>
            <div className="col-4 col-sm-5 justify-content-center ">
              <div id={props.name +"-label"} className="col d-flex justify-content-center label">{props.name} Length</div>
              <div className="textField lengthField " id={props.name +'-length'}>
                {props.length}
                </div>
            </div>
            <div className="col-auto incrementButton align-self-center">
              {props.increment}
            </div>

          </div>
        </div>
      )
    }

    const BreakLengthContainer = connect (
      state => ({length: state.breakLength}), 
      null
    )(LengthContainer);

    const SessionLengthContainer = connect (
      state => ({length: state.sessionLength}),
      null
    )(LengthContainer);



class ClockComponent extends React.Component {
  constructor(props){
    super(props)
    this.state = {};
    this.timer = "";

    this.triggerTimer = this.triggerTimer.bind(this);
    this.clockTick = this.clockTick.bind(this);
    this.reset = this.reset.bind(this);
    this.playAudio = this.playAudio.bind(this);
  }


  triggerTimer(){

    if(this.timer){
    //  console.log('trigger timer stopping clock');
      clearInterval(this.timer);
      this.timer = "";
    }
    else{
  //    console.log('trigger timer starting clock ');
      this.timer = setInterval(this.clockTick, interval);
    }
    this.props.toggleTimer();
  }
  clockTick(){
    if(this.props.time == 0){

      clearInterval(this.timer);
      let sound = document.getElementById("beep");
      sound.play();
      this.timer = "";
      this.props.toggleTimer();
      this.props.switchClocks();

      setTimeout(this.triggerTimer(), interval*2);
    }
    else{
      this.props.decrementTimer(interval);
    }
    
  }

  reset(){
    clearInterval(this.timer);
    let sound = document.getElementById("beep");
    sound.pause();
    sound.currentTime = 0;
    this.timer = "";
    this.props.reset();
  }

  playAudio(){
    document.getElementById('beep').play();
  }

  render(){

      let minutes = Math.floor(this.props.time / 60);
      let seconds = this.props.time - minutes * 60;

      minutes = ("00" + minutes).slice (-2);
      seconds = ("00" + seconds).slice (-2);
    return(
      <div className="textField d-flex justify-content-center clockField" id='time-left'> {minutes + ":" + seconds} </div>
    )
  }
}

 ClockComponent = connect(
  function mapStateToProps(state, ownState){
    return { time: state.time}
  }, 
  function mapDispatchToProps(dispatch, ownProps){
    return {
      reset: ()=> {
        dispatch({type: RESET});
      },
      decrementTimer: (interval) =>{
        dispatch({type: DEC_TIMER, interval: interval});
      },
      switchClocks : () => {
        dispatch({type: SWITCH_CLOCKS});
      },
      toggleTimer: () => {
        dispatch({type: TIMER});
      }
    }
  },null, {forwardRef: true})(ClockComponent)


class App extends React.Component{
  constructor(props){
    super(props)
    this.state ={
      
    }
    this.reset = this.reset.bind(this);
    this.triggerTimer = this.triggerTimer.bind(this);
    this.clockRef = React.createRef();
  }

  reset(){
    this.refs.clockRef.reset();
  }

  triggerTimer(){
    this.refs.clockRef.triggerTimer();
  }
  render(){

   // console.log("in render for app ");

    let title = this.props.clockState == SESSION ? "Session": "Break";
    return (
        <div className="outerDiv themeThree container-fluid " style={{backgroundColor: "green"}}>         

          <div className="innerDiv row " >

            <Header title="Pomodoro Clock" />

            <div className="col col-sm-12" >
              <div className="row justify-content-sm-center align-items-sm-end">
                <div className="col-12 col-sm-4 order-sm-2 align-items-end" >

                    <div id="timer-label" className="d-flex justify-content-center label">{title}</div>

                      <ClockComponent ref="clockRef"/>
                      <audio preload="auto" id="beep" src="https://goo.gl/65cBl1" style={{width: "100%"}}></audio>
                </div>   
                <div className="col-6 col-sm-auto order-sm-1 align-self-sm-end d-flex justify-content-end">
                  <button className="button clockButton" id="reset" onClick={this.reset}>
                    <i className="fas fa-redo " ></i>
                  </button>
                </div>


                <div className="col-6 col-sm-auto order-sm-3 align-self-sm-end d-flex justify-content-start">
                  <button className="button clockButton" id="start_stop" onClick={this.triggerTimer}>
                    <i className="fas fa-play " ></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="col col-sm-12 ">
              <div className="row justify-content-center">
                <SessionLengthContainer name="session" decrement={<SessionDecrementButton name="session-decrement"/>} increment={<SessionIncrementButton name="session-increment"/>}/>
                <BreakLengthContainer name="break" decrement={<BreakDecrementButton name="break-decrement"/>} increment={<BreakIncrementButton name="break-increment"/>}/>
              </div>
            </div>

          </div>

        </div>
    )
  }
}

App = connect(
  function mapStateToProps(state, ownProps){
    let myState = {
      clockState: state.clockState
    }
    return myState;
  }, 
  null
)(App);

// End App component


App.id = "clock";

const AppWrapper = ()=> <Provider store={store}><App /></Provider>;

//const AppWrapper = () => <div> super cow </div>;
export default AppWrapper;

