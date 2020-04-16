import React from 'react';
import {render} from 'react-dom';
import {style} from './style';


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
	//console.log("messageReducer final state: " + JSON.stringify(holder))
	return holder;
}

const store = createStore(messageReducer);

const DrumPad = (props) => {
	return (
		<button className={style + " drum-pad"} 
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
			<audio className={style + " clip"} src={props.clip} id={props.letter}></audio> {props.letter} 
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
			{letter: 'Q', code: 81, id: 'Heater-1', clip: '/sounds/Heater-1.mp3'}, 
			{letter: 'W', code: 87, id: 'Heater-2', clip: '/sounds/Heater-2.mp3'}, 
			{letter: 'E', code: 69, id: 'Heater-3', clip: '/sounds/Heater-3.mp3'}, 
			{letter: 'A', code: 65, id: 'Heater-4', clip: '/sounds/Heater-4_1.mp3'}, 
			{letter: 'S', code: 83, id: 'Clap', clip: '/sounds/Heater-6.mp3'}, 
			{letter: 'D', code: 68, id: 'Open-HH', clip: '/sounds/Dsc_Oh.mp3'}, 
			{letter: 'Z', code: 90, id: "Kick-n'-Hat", clip: '/sounds/Kick_n_Hat.mp3'},
			{letter: 'X', code: 88, id: 'Kick', clip: '/sounds/RP4_KICK_1.mp3'}, 
			{letter: 'C', code: 67, id: 'Closed-HH', clip: '/sounds/Cev_H2.mp3'}],
		[
			{letter: 'Q', code: 81, id: 'Chord-1', clip: '/sounds/Chord_1.mp3'}, 
			{letter: 'W', code: 87, id: 'Chord-2', clip: '/sounds/Chord_2.mp3'}, 
			{letter: 'E', code: 69, id: 'Chord-3', clip: '/sounds/Chord_3.mp3'}, 
			{letter: 'A', code: 65, id: 'Shaker', clip: '/sounds/Give_us_a_light.mp3'}, 
			{letter: 'S', code: 83, id: 'Open-HH', clip: '/sounds/Dry_Ohh.mp3'}, 
			{letter: 'D', code: 68, id: 'Closed-HH', clip: '/sounds/Bld_H1.mp3'}, 
			{letter: 'Z', code: 90, id: "Punchy-Kick", clip: '/sounds/punchy_kick_1.mp3'},
			{letter: 'X', code: 88, id: 'Side-Stick', clip: '/sounds/side_stick_1.mp3'}, 
			{letter: 'C', code: 67, id: 'Snare', clip: '/sounds/Brk_Snr.mp3'}
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
		//console.log("DrumPad callback  " + id);
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
			rowArray.push(<div className={style + " padRow"}  key={'row' + i}>{padArray}</div>);
		}
		

		return <div className={style + " padContainer "}>{rowArray}</div>;
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
		//console.log("calling map props in the drum pads connect");
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

//// START slider component
class ToggleComponent extends React.Component{
	constructor(props){
		super(props);
		let toggleStyle = {};

		if(props.backgroundWhenOn){
			toggleStyle["--bg-rightpos"] = props.backgroundWhenOn;
		}
		if(props.backgroundWhenOff){
			toggleStyle["--bg-leftpos"] = props.backgroundWhenOff;
		}

		//console.log("sliders are: " + JSON.stringify(toggleStyle))

		let text = [];
		if(props.leftText){
			text.push(<span className={style + " leftText"} key={this.props.id + "leftText"}>{props.leftText}</span>);
		}
		if(props.rightText){
			text.push(<span className={style + " rightText"} key={this.props.id + "rightText"}>{props.rightText}</span>)
		}
		this.state = {
			checked: props.checked,
			toggleStyle: toggleStyle,
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
			<div className={style + " toggleContainer"}>
				
				<input type="checkbox" className={style + " toggle"} id={this.props.id}  onChange={this.handleClick} checked={this.state.checked}></input>
				<label className={style + " toggleBackground"} style={this.state.toggleStyle}  htmlFor={this.props.id} > 
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
		//console.log('in click callback');
		this.props.changeBank();
	}

	render(){

		console.log("rendering DrumDetails, state is " + JSON.stringify(this.props));

		return(

			<div id="details" className={style + " detailContainer"}>
 				<div className={style + " _row" } >
 					<div className={style +" label"}>Bank</div>
					<div className={style +" content"} style={{paddingLeft: '0px'}}>

							<ToggleComponent id="bank" checked={true}  
							clickCallback={this.clickCallback} 
							leftText="1" rightText="2"/>

					</div>
				</div>
				<div className={style + " _row" }>
				 	<div className={style +" label"}>Clip</div>
				 	<div className={style + " content"} >
				 		<div id="sample" className={style + " sampleText" }>{this.props.sample}</div>
				 	</div>
					
    			</div>
    			<div className={style + " _row" }>
    				<div className={style +" label"}>Volume</div>
    				<div className={style + " content"} >
						<input type="range" className={style + " slider"} value={this.props.volume} min="0" max="100" id="customRange1" onChange={this.props.changeVolume} />

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
			//	console.log("got change volume event: " + event.target.value)
				dispatch({type: VOLUME, volume: event.target.value});
			}
		}

	})(DrumDetails);

// App component section

class App extends React.Component{
  constructor(props){
    super(props)
    this.state ={
      fullScreen: props.fullScreen ? "fullScreen" : ""
    }
	console.log("Constructed Drum Maghine created by Mariano Hernandez 2020. Enjoy")
  }

  render(){
  	let theme = this.props.bank?"yellowMode":"blueMode";
    return (
        <div className={style + " outerDiv " + theme + " " + this.state.fullScreen} id="drum-machine">         
        	<div className={style + " innerDiv"}  id="display">
        		<div className={style + " header"}>
        			<div className={style + " title"}>Awesome Drums</div>
        			<div id="powerContainer" className={style }>

						<ToggleComponent id="power" checked={true}  
							backgroundWhenOn={style.gogreen}  
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

const AppWrapper = (props)=><Provider store={store}><App {...props}/></Provider>;

export default AppWrapper;
