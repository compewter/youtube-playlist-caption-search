import React, { Component } from 'react';
import './Search.css';
import { Container, Divider, Header, Image, Input, Item } from 'semantic-ui-react'
import Result from './Result'

class PlaylistSelector extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      playlist: {},
      searchTerm: ''
    }
  }
  componentDidMount() {
    this.setState({
      loading: true
    })
    fetch('https://us-central1-youtube-caption-search-191623.cloudfunctions.net/get-playlist-details', {
      method: "POST",
      mode: 'cors',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        "ids": this.props.match.params.playlistId
      })
    }).then((response)=>{
      response.json().then((playlists)=>{
        this.setState({
          loading: false,
          playlist: playlists[0]
        })
      })
    })
  }
  getYouTubeMetadata = (searchResults) => {
    fetch('https://us-central1-youtube-caption-search-191623.cloudfunctions.net/get-video-metadata', {
      method: "POST",
      mode: 'cors',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        "ids": searchResults.map((result)=>{ return result.name.slice(0, result.name.indexOf('.')) }).join(',')
      })
    }).then((response)=>{
      response.json().then((metadatas)=>{
        this.setState({
          searching: false,
          searchResults: searchResults.map((result)=>{
            return Object.assign(result, metadatas.find((metadata)=>{ return metadata.id+'.xml' === result.name }))
          })
        })
      })
    })
  }
  search = (e, data) => {
    if(e.key === 'Enter'){
      this.setState({
        searching: true
      })

      let query = this.state.searchTerm
      let playlist = this.props.match.params.playlistId
      let headers = new Headers()
      headers.append('Accept', 'application/vnd.github.v3.text-match+json')
      fetch(`https://api.github.com/search/code?q=${query}+in:file+repo:compewter/youtube-playlist-caption-search+path:playlists/${playlist}`, {headers})
        .then((response)=>{
          response.json()
            .then((result)=>{
              this.getYouTubeMetadata(result.items)
            })
            .catch((err)=>{
              console.log(err)
            })
        })
        .catch((err)=>{
          console.log(err)
        })
    }
  }
  render() {
    return (
      <Container className="search-container">
        { this.state.loading ?
            <Image src="/loading.gif" centered/>
          :
            <Container>
              <Header as='h1'><a target="blank" href={`https://www.youtube.com/playlist?list=${this.state.playlist.id}`}>{this.state.playlist.snippet.title}</a></Header>
              <Image
                bordered
                centered
                src={this.state.playlist.snippet.thumbnails.medium.url}
              />
              <Input
                className="search-input"
                icon="search"
                iconPosition="left"
                size="large"
                disabled={this.state.searching}
                loading={this.state.searching}
                onChange={(e, data) => { this.setState({searchTerm: data.value})} }
                value={this.state.searchTerm}
                onKeyPress={this.search}
              />
              <Divider />
              { this.state.searching ?
                  <Image src="/loading.gif" centered/>
                :
                  this.state.searchResults &&
                    <Container>
                      <Header as="h2">{`Found ${this.state.searchResults.length} match${this.state.searchResults === 1 ? '' : 'es'}`}</Header>
                      <Item.Group divided>
                        {this.state.searchResults.map((result)=>{
                          return <Result result={result} key={result.name} query={this.state.searchTerm} playlist={this.props.match.params.playlistId}/>
                        })}
                      </Item.Group>
                    </Container>
              }
            </Container>
        }
      </Container>
    );
  }
}

export default PlaylistSelector;
