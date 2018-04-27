import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { Card } from 'semantic-ui-react'

import './Playlist.css';

class Playlist extends Component {
  render() {
    return (
      <Card
        as={Link}
        description={this.props.playlist.snippet.description}
        header={this.props.playlist.snippet.title}
        to={`/search/${this.props.playlist.id}`}
        meta={this.props.playlist.snippet.channelTitle}
        image={this.props.playlist.snippet.thumbnails.medium.url}
      />
    );
  }
}

Playlist.propTypes = {
  playlist: PropTypes.object
};

export default Playlist;
