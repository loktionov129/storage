import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';

function Main(props) {
  return (
    <div>Main</div>
  );
}

function About(props) {
  return (
    <div>WELCOME TO ABOUT</div>
  );
}

export default class App extends Component {

  render() {
    return (
      <div className="App">
        <Link to="/">main</Link> &nbsp;
        <Link to="/about">abut</Link>
        <Switch>
          <Route exact path="/" component={Main} />
          <Route path="/about" component={About} />
        </Switch>
      </div>
    );
  }
}
