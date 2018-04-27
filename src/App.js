import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import logo from './logo.png';
import './App.css';
import PlaylistSelector from './components/Playlist/Selector';
import Search from './components/Search/Search';
import { Menu } from 'semantic-ui-react'

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <Link to="/"><img src={logo} className="App-logo" alt="logo" /></Link>
            <h1 className="App-title">Caption Search</h1>
          </header>
          <Route exact path="/" component={PlaylistSelector}/>
          <Route path="/search/:playlistId" component={Search}/>
          <footer className="App-footer" fixed="bottom"><p>© 2018 - <a href="https://www.thecompewterlab.com" target="_blank">The Compewter Lab</a>. Ideas? Thoughts? Bugs? Let's chat! <a href="mailto:michael@thecompewterlab.com">michael@thecompewterlab.com</a></p></footer>
        </div>
      </Router>
    );
  }
}

export default App;
