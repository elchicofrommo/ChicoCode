import React from 'react';
import {render} from 'react-dom';
import styles from './style.scss';


import {Provider, connect} from 'react-redux';
import {createStore} from 'redux';

// Section for setting up state
const defaultState = {
	message: "Hello world with my redux",
	sample: "", 
	power: true, 
	volume: 50,
	bank: true
}

const PLAY = "play";
const POWER = 'power';
const BANK = 'bank';
const VOLUME = 'volume';

const createPlayAction = (id) => {
	return {
		type: PLAY, 
		id: id
	}

}


const messageReducer = (state=defaultState, action) => {

	let holder = {...state}

	switch(action.type){
		case PLAY:
			holder.sample =  action.id
			break;
		case POWER: 
			holder.power = !holder.power;
			break;
		case BANK:
			holder.bank = !holder.bank;
			holder.sample = "";
			break;
		case VOLUME:
			holder.volume = action.volume;
			break;
		default: 
		break;
	}
	console.log("messageReducer final state: " + JSON.stringify(holder))
	return holder;
}

const store = createStore(messageReducer);

const DrumPad = (props) => {
	return (
		<button className="drum-pad" 
			id={props.id} 
			key={props.id}
			disabled={props.disabled}
			onClick={((event) => {
				let sound = document.getElementById(props.letter);
				sound.currentTime = 0;
				sound.volume = props.volume/100;
				sound.play();
				props.callback(props.id);
			})}>
			<audio className="clip" src={props.clip} id={props.letter}></audio> {props.letter} 
		</button>
	)
}


// end section for setting up redux

/////// Setting up the drum machine component
class DrumPads extends React.Component {
	constructor(props){
		super(props);
		this.state =  {

		};
		this.pads = [[
			{letter: 'Q', code: 81, id: 'Heater-1', clip: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3'}, 
			{letter: 'W', code: 87, id: 'Heater-2', clip: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-2.mp3'}, 
			{letter: 'E', code: 69, id: 'Heater-3', clip: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-3.mp3'}, 
			{letter: 'A', code: 65, id: 'Heater-4', clip: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-4_1.mp3'}, 
			{letter: 'S', code: 83, id: 'Clap', clip: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-6.mp3'}, 
			{letter: 'D', code: 68, id: 'Open-HH', clip: 'https://s3.amazonaws.com/freecodecamp/drums/Dsc_Oh.mp3'}, 
			{letter: 'Z', code: 90, id: "Kick-n'-Hat", clip: 'https://s3.amazonaws.com/freecodecamp/drums/Kick_n_Hat.mp3'},
			{letter: 'X', code: 88, id: 'Kick', clip: 'https://s3.amazonaws.com/freecodecamp/drums/RP4_KICK_1.mp3'}, 
			{letter: 'C', code: 67, id: 'Closed-HH', clip: 'https://s3.amazonaws.com/freecodecamp/drums/Cev_H2.mp3'}],
		[
			{letter: 'Q', code: 81, id: 'Chord-1', clip: 'https://s3.amazonaws.com/freecodecamp/drums/Chord_1.mp3'}, 
			{letter: 'W', code: 87, id: 'Chord-2', clip: 'https://s3.amazonaws.com/freecodecamp/drums/Chord_2.mp3'}, 
			{letter: 'E', code: 69, id: 'Chord-3', clip: 'https://s3.amazonaws.com/freecodecamp/drums/Chord_3.mp3'}, 
			{letter: 'A', code: 65, id: 'Shaker', clip: 'https://s3.amazonaws.com/freecodecamp/drums/Give_us_a_light.mp3'}, 
			{letter: 'S', code: 83, id: 'Open-HH', clip: 'https://s3.amazonaws.com/freecodecamp/drums/Dry_Ohh.mp3'}, 
			{letter: 'D', code: 68, id: 'Closed-HH', clip: 'https://s3.amazonaws.com/freecodecamp/drums/Bld_H1.mp3'}, 
			{letter: 'Z', code: 90, id: "Punchy-Kick", clip: 'https://s3.amazonaws.com/freecodecamp/drums/punchy_kick_1.mp3'},
			{letter: 'X', code: 88, id: 'Side-Stick', clip: 'https://s3.amazonaws.com/freecodecamp/drums/side_stick_1.mp3'}, 
			{letter: 'C', code: 67, id: 'Snare', clip: 'https://s3.amazonaws.com/freecodecamp/drums/Brk_Snr.mp3'}
		]];

		this.generatePads = this.generatePads.bind(this)
		this.handleKeyPress = this.handleKeyPress.bind(this);
		this.getPadByCode = this.getPadByCode.bind(this);
		this.playCallback = this.playCallback.bind(this);
	}

	getPadByCode(code){
		let bank = this.props.bank?0:1;

		return this.pads[bank].find(x=>x.code===code)
	}

	handleKeyPress(event){
		//alert("saw key prese event " + event.keyCode);
		let pad = this.getPadByCode(event.keyCode);
		//alert(JSON.stringify(pad));
		if(pad)
			document.getElementById(pad.id).click()
	}

	playCallback(id){
		console.log("DrumPad callback  " + id);
		this.props.playClip(id);
	}

	generatePads(){
		let rowArray = [];
		for(let i=0;i<3;i++){

			let padArray = []
			let bank = this.props.bank?0:1;
			for(let j=0;j<3;j++){
				let index = i*3 + j;

				padArray.push(<DrumPad 
					id={this.pads[bank][index].id}
					key={this.pads[bank][index].id}
					letter={this.pads[bank][index].letter}
					clip={this.pads[bank][index].clip}
					callback={this.playCallback} 
					disabled={!this.props.power}
					volume={this.props.volume}/>);
			}
			rowArray.push(<div className="padRow"  key={'row' + i}>{padArray}</div>);
		}
		

		return <div className="padContainer ">{rowArray}</div>;
	}
	componentDidMount() {
    	document.addEventListener('keydown', this.handleKeyPress);
  	}
  	componentWillUnmount() {
    	document.removeEventListener('keydown', this.handleKeyPress);
  	}

	render(){
		return(
			
			this.generatePads()

		);
	}
}

DrumPads = connect(
	function mapPropsToState(state, ownProps){
		console.log("calling map props in the drum pads connect");
		return state;
	},
	function mapDispatchToState(dispatch, ownProps){
		return {
			playClip: (id)=>{

				dispatch(createPlayAction(id))
			}
		}
	}
)(DrumPads);
/////// End Drum Machine Component

//// START slider component
class ToggleComponent extends React.Component{
	constructor(props){
		super(props);
		let style = {};

		if(props.backgroundWhenOn){
			style["--bg-rightpos"] = props.backgroundWhenOn;
		}
		if(props.backgroundWhenOff){
			style["--bg-leftpos"] = props.backgroundWhenOff;
		}

		console.log("sliders are: " + JSON.stringify(style))

		let text = [];
		if(props.leftText){
			text.push(<span className="leftText" key={this.props.id + "leftText"}>{props.leftText}</span>);
		}
		if(props.rightText){
			text.push(<span className="rightText" key={this.props.id + "rightText"}>{props.rightText}</span>)
		}
		this.state = {
			checked: props.checked,
			style: style,
			text: text
		}


		this.handleClick = this.handleClick.bind(this);

	}

	handleClick(event){
		this.setState({checked: !this.state.checked})
		this.props.clickCallback(event);
	}

	render(){

		return(
			<div className="toggleContainer">
				
				<input type="checkbox" className="toggle" id={this.props.id}  onChange={this.handleClick} checked={this.state.checked}></input>
				<label className="toggleBackground" style={this.state.style}  htmlFor={this.props.id} > 
					{this.state.text}
				</label>
				
			</div>
		)
	}
}
//// END slider component
////// DrumDetails component
class DrumDetails extends React.Component {
	constructor(props){
		super(props);
		this.state = {};
		this.clickCallback = this.clickCallback.bind(this);
	}

	clickCallback(event) {
		console.log('in click callback');
		this.props.changeBank();
	}

	render(){

		console.log("rendering DrumDetails, state is " + JSON.stringify(this.props));

		return(

			<div id="details" className="detailContainer container">
 				<div className="row" >
 					<div className="col-4 d-flex justify-content-end align-items-center">Bank</div>
					<div id="bankContainer" className="col-8 d-flex justify-content-left align-items-center" style={{paddingLeft: '0px'}}>

							<ToggleComponent id="bank" checked={true}  
							clickCallback={this.clickCallback} 
							leftText="1" rightText="2"/>

					</div>
				</div>
				<div className="row">
				 	<div className="col-4 d-flex justify-content-end align-items-center">Clip</div>
				 	<div className="col-8" style={{paddingLeft: 0}} >
				 		<div id="sample" className="sampleText" >{this.props.sample}</div>
				 	</div>
					
    			</div>
    			<div className="row">
    				<div className="col-4 d-flex justify-content-end align-items-center">Volume</div>
    				<div className="col-8" style={{paddingLeft: '0px'}}>
						<input type="range" className="slider" value={this.props.volume} min="0" max="100" id="customRange1" onChange={this.props.changeVolume} />

    				</div>
    			</div>

			</div>
		)
	}
}

DrumDetails = connect(
	(state) => {
		return state
	}, 
	(dispatch) => {
		return{
			changeBank : () => {
				dispatch({type: BANK});
			},
			changeVolume: (event) => {
				console.log("got change volume event: " + event.target.value)
				dispatch({type: VOLUME, volume: event.target.value});
			}
		}

	})(DrumDetails);

// App component section

class App extends React.Component{
  constructor(props){
    super(props)
    this.state ={
      
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
  	let theme = this.props.bank?"yellowMode":"blueMode";
    return (
        <div className={"outerDiv " + theme} id="drum-machine">         
        	<div className="innerDiv"  id="display">
        		<div className="header">
        			<div className="title">Awesome Drums</div>
        			<div id="powerContainer">

						<ToggleComponent id="power" checked={true}  
							backgroundWhenOn={styles.gogreen}  
							clickCallback={this.props.togglePower} 
							leftText="On" rightText="Off"/>
					</div>
        		</div>
        		<DrumPads />
        		<DrumDetails />

            </div>

    
        </div>
    )
  }
}

App = connect(
	function mapStateToProps(state, ownProps){
		console.log("observed mapStateToProps, state is " + JSON.stringify(state));


		return state;

	}, 
	function mapDispatchToProps(dispatch){
		return {
			testFunction: (testInput) => {

			},
			togglePower: (event) => {
				dispatch({type: POWER})
			}
		}
	}
)(App);

// End App component
App.id = "drums";

const AppWrapper = ()=><Provider store={store}><App /></Provider>;

export default AppWrapper;
