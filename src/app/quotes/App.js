
import React from 'react';

import {render} from 'react-dom';
import styles from './style';

var $ = require("jquery");


const myVar = <div>Mario</div>
      
const colors =[
  "#f4f1af", "#cfafff", "#aadff6", "#d6f3a1"
]
 
class App extends React.Component {
  constructor(props){
    super(props)
    let rand = Math.floor(Math.random() * 100) % 4 
    console.log(rand)
    
    this.state = {
      color: colors[rand],
      author: "Mario Hernandez",
      text: "Welcome to my Random Quote Machine!"
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
      color: colors[rand]
    })

  }
  render(){
    let myName = "my name is mario"
    return(

        <div className="outerDiv d-flex justify-content-center align-items-center" style={{background: this.state.color}}>
          <div className="innerDiv" style={{ color: this.state.color}} id="quote-box">
              <div id="text" >
                <i className="fas fa-quote-right"></i>
                {this.state.text} 
              </div>
              <div id="author">{this.state.author}</div>
              <div className="row">
                <div className="col-md-7 col-xs-12 " >
                  <a href='twitter.com/intent/tweet' id="tweet-quote" onClick={this.tweet} style={{color: this.state.color}}>
                    <i className="fab fa-twitter-square fa-3x"  ></i>
                  </a>
                </div>
                <div className="col-md-5 col-xs-12">
                  <button id="new-quote" className="btn btn-default quoteButton" style={{background: this.state.color}} onClick={this.getNewQuote}>New Quote</button>
                </div>
              </div>
          </div>
        </div>
    )
  }
}

// End App component
App.id = "drums";

const AppWrapper = ()=><App />;

export default AppWrapper;

