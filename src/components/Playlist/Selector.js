import React, { Component } from 'react';
import './Selector.css';
import { Card, Container, Header, Image } from 'semantic-ui-react'
import Playlist from './Playlist'
//import playlistIDs from '../../../public/playlists'
const playlistIDs = "PL6KegyXMZ6zkNm33HFdW6x7CANHjwopif"

class PlaylistSelector extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      playlists: []
    }
  }
  componentDidMount() {
    this.setState({
      loading: true,
      playlists: []
    })
    fetch('https://us-central1-youtube-caption-search-191623.cloudfunctions.net/get-playlist-details', {
      method: "POST",
      mode: 'cors',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        "ids": playlistIDs
      })
    }).then((response)=>{
      response.json().then((playlists)=>{
        this.setState({
          loading: false,
          playlists
        })
      })
    })
  }
  render() {
    let Playlists = this.state.playlists.map((playlist)=>{
      return <Playlist playlist={playlist} key={playlist.id}/>
    })
    return (
      <Container className="playlist-container">
        <Header as="h1">Select Playlist</Header>
        { this.state.loading ?
            <Image src="/loading.gif" centered/>
          :
            <Card.Group centered children={Playlists} />
        }
      </Container>
    );
  }
}

export default PlaylistSelector;
