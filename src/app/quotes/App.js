
import React from 'react';
import {render} from 'react-dom';
import {style} from './style.scss';

var $ = require("jquery");


const myVar = <div>Mario</div>
const themes = [
  "themeOne", "themeTwo", "themeThree", "themeFour"
]

class App extends React.Component {
  constructor(props){
    super(props)
    let rand = Math.floor(Math.random() * 100) % 4 
    console.log("app constuctor: " + rand + " fullscreen: " + props.fullScreen);
    
    this.state = {
      theme: themes[rand],
      author: "Mario Hernandez",
      text: "Welcome to my Random Quote Machine!",
      fullScreen: props.fullScreen ? "fullScreen" : ""
    } 
    this.tweet = this.tweet.bind(this)
    this.getNewQuote = this.getNewQuote.bind(this)
    this.setQuoteState = this.setQuoteState.bind(this)
  }
  tweet(event){
    event.preventDefault()
    console.log("saw a tweet")
  }
  getNewQuote(event){
    event.preventDefault();
    console.log("observed event for new quote")

     $.ajax({
        url: "https://api.forismatic.com/api/1.0/?method=getQuote&format=jsonp&lang=en&jsonp=?",
        dataType: "jsonp",
        success: function(response){
          console.log(JSON.stringify(response))
          this.setQuoteState(response)
        }.bind(this),
        error(error){
          console.log("failed the response " + JSON.stringify(error))
        }
      });   
  } 
  setQuoteState(response){
    console.log("set quote state")
    let rand = Math.floor(Math.random() * 100) % 4 
    this.setState({
      text: response.quoteText,
      author: response.quoteAuthor,
      theme: themes[rand],
      fullScreen: this.state.fullScreen
    })

  }
  render(){

    console.log("rendering: a object is : " + JSON.stringify(style));
    let myName = "my name is mario"
    return(

        <div className={style + " outerDiv " + this.state.theme + " " + this.state.fullScreen} >
          <div className={style + " innerDiv" } style={{ color: this.state.color}} id="quote-box">
              <div id="text" className={style}>
                <i className={style + " fas fa-quote-right" }></i>
                {this.state.text} 
              </div>
              <div id="author" className={style}>{this.state.author}</div>
              <div id="buttonRow" className={style}>
                <div  >
                  <a href='twitter.com/intent/tweet' id="tweet-quote" className={style} onClick={this.tweet} >
                    <i className={style +  " fab fa-twitter-square fa-3x"}  ></i>
                  </a>
                </div>
                <div >
                  <button id="new-quote" className={"quoteButton " + style}  onClick={this.getNewQuote}>New Quote</button>
                </div>
              </div>
          </div>
        </div>
    )
  }
}

// End App component
App.id = "quotes";

const AppWrapper = (props)=><App {...props}/>;

export default AppWrapper;

