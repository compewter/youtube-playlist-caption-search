import React, { Component } from 'react';
import PropTypes from 'prop-types'

import { Item } from 'semantic-ui-react'

import './Result.css';

class Result extends Component {
  constructor(props){
    super(props)
    this.state = {
      matches: []
    }
  }
  componentDidMount(){
    let {result, query} = this.props
    let textMatches = result.text_matches
    let videoID = result.name.slice(0, this.props.result.name.indexOf('.'))
    this.getContent(textMatches, query, videoID)
  }

  findMatches = (content, matches) => {
    return matches.map((match)=>{
      let fragment = match.fragment
      let fragmentIndex = content.indexOf(fragment)
      let sliceStart = fragmentIndex-500 < 0 ? 0 : fragmentIndex-500
      let sliceEnd = fragmentIndex+500 > content.length ? content.length-1 : fragmentIndex+500
      let largerFragmentSlice = content.slice(sliceStart, sliceEnd)
      let longestMatchText = match.matches.reduce((txt, mtch)=>{
        return mtch.text.length > txt.length ? mtch.text : txt
      },'')
      let { filteredText, timeStamp } = filterXML(largerFragmentSlice, 150, longestMatchText)
      if(timeStamp){
        if(isNaN(timeStamp/100)){
          debugger
        }
        return {
          text: filteredText,
          timeStamp: Math.floor(timeStamp/1000),
          match: longestMatchText
        }
      }else{
        return null
      }
    })
  }

  getContent = (textMatches, query, videoID) => {
    fetch(`https://raw.githubusercontent.com/compewter/youtube-playlist-caption-search/master/playlists/${this.props.playlist}/timedtext/${videoID}.xml`)
      .then((response)=>{
        response.text()
          .then((result)=>{
            let matches = this.findMatches(result, textMatches)
            this.setState({
              matches: matches.map((match)=>{
              return Object.assign({
                  query,
                  videoID
                }, match)
              })
            })
          })
          .catch((err)=>{
            console.log(err)
          })
      })
      .catch((err)=>{
        console.log(err)
      })
  }

  render() {
    let {result} = this.props
    let {matches} = this.state
    if(!result.snippet){
      console.log(result)
      return null
    }
    return (
      <Item>
        <Item.Image as='a' target='_blank' href={`https://www.youtube.com/watch?v=${result.name.slice(0, result.name.indexOf('.'))}`} src={result.snippet.thumbnails.medium.url} size='medium'/>
        <Item.Content>
          <Item.Header as='a' target='_blank' href={`https://www.youtube.com/watch?v=${result.name.slice(0, result.name.indexOf('.'))}`}>{result.snippet.title}</Item.Header>
          <Item.Meta>{result.snippet.channelTitle}</Item.Meta>
          <Item.Description>
            {matches.map((match,ind)=>{
              if(!match) return null
              return <a
                  target='_blank'
                  href={`https://www.youtube.com/watch?v=${match.videoID}&t=${match.timeStamp}`}
                  key={`${match.videoID}_${ind}`}
                  className="match-url"
                >"...{
                  match.text.split(match.match).map((chunk, ind) =>{
                    return (<span key={`${match.videoID}_${ind}`}>{chunk}</span>)
                  }).reduce((pv, chunk, index, arr)=>{
                    if(index === arr.length-1){
                      return pv.concat([chunk])
                    }
                    return pv.concat([chunk, <b key={`${match.videoID}_${index}_b`}>{match.match}</b>])
                  },[])
                }..."</a>
            })}
          </Item.Description>
        </Item.Content>
      </Item>
    );
  }
}

Result.propTypes = {
  result: PropTypes.object
};

function filterXML(content, quoteLength, match){
  let filteredText = ''
  let ignoreChar = false
  let startIndex = content.indexOf('>')
  if(!content.slice(0, startIndex).includes('p t="')){
    startIndex = content.indexOf('>', startIndex+1)
  }
  content.slice(startIndex).split('').forEach((char)=>{
    if(char === '<'){
      ignoreChar = true
    }else if(char === '>'){
      ignoreChar = false
    }else if (!ignoreChar){
      filteredText += char === '\n' ? ' ' : char
    }
  })
  if(filteredText.length < quoteLength){
    return {
      filteredText,
      timeStamp: findTimeStamp(content)
    }
  }else{
    let shortenedContent = content.slice(content.indexOf('p t="',1), content.length-content.indexOf('p t="',1))
    if(shortenedContent.length < 200){
      return {
        filteredText,
        timeStamp: findTimeStamp(content)
      }
    }
    return filterXML(shortenedContent, quoteLength, match)

    /*
    let splitContent = content.split(match)
    if(splitContent.length === 2){
      let [chunkA, chunkB] = splitContent
      let sizeDifference = chunkA.length - chunkB.length
      if(chunkA.length > chunkB.length){
        chunkA = chunkA.slice(sizeDifference)
        let sliceSize = sizeDifference < 20 ? Math.floor((20-sizeDifference)/2) : 0
        console.log('>')
        return filterXML(chunkA.slice(sliceSize)+match+chunkB.slice(0, chunkB.length-sliceSize), quoteLength, match)
      }else if(chunkB.length > chunkA.length){
        chunkB = chunkB.slice(0, chunkB.length-sizeDifference)
        let sliceSize = sizeDifference > -20 ? Math.abs(Math.floor((sizeDifference+20)/2)) : 0
        console.log('<')
        return filterXML(chunkA.slice(sliceSize)+match+chunkB.slice(0, chunkB.length-sliceSize), quoteLength, match)
      }else{
        console.log('=')
        return filterXML(chunkA.slice(chunkA.indexOf('p t="'))+match+chunkB.slice(0,chunkB.length-10), quoteLength, match)
      }
    }else{
      return filterXML(content.slice(10, content.length-10), quoteLength, match)
    }*/
  }
}

function findTimeStamp(content){
  let firstTimeIndex = content.indexOf('p t="')
  return content.slice(firstTimeIndex+5, content.indexOf('"',firstTimeIndex+5))
}

export default Result;
